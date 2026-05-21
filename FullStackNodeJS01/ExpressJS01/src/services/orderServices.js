const { prisma } = require("../config/database");

const autoConfirmOrders = async (userId) => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const pendingOrders = await prisma.order.findMany({
      where: {
        userId: parseInt(userId),
        status: "NEW",
        createdAt: {
          lt: thirtyMinutesAgo,
        },
      },
    });

    if (pendingOrders.length > 0) {
      await prisma.order.updateMany({
        where: {
          id: {
            in: pendingOrders.map((o) => o.id),
          },
        },
        data: {
          status: "CONFIRMED",
        },
      });
    }
  } catch (error) {
    console.error("Error auto-confirming orders:", error);
  }
};

const createOrder = async (
  userId,
  paymentMethod = "COD",
  shippingAddress,
  phone,
) => {
  try {
    if (!shippingAddress || !phone) {
      return { EC: 1, EM: "Địa chỉ nhận hàng và số điện thoại là bắt buộc" };
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { EC: 2, EM: "Giỏ hàng của bạn đang trống" };
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return {
          EC: 3,
          EM: `Sản phẩm "${item.product.name}" không đủ hàng trong kho (Còn lại: ${item.product.stock})`,
        };
      }
    }

    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      totalPrice += item.product.price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: parseInt(userId),
          totalPrice,
          paymentMethod,
          shippingAddress,
          phone,
          status: "NEW",
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return { EC: 0, EM: "Đặt hàng thành công", data: result };
  } catch (error) {
    console.error("createOrder error:", error);
    return { EC: -1, EM: "Lỗi hệ thống khi đặt hàng" };
  }
};

const getUserOrders = async (userId) => {
  try {
    await autoConfirmOrders(userId);

    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { EC: 0, data: orders };
  } catch (error) {
    console.error("getUserOrders error:", error);
    return { EC: -1, EM: "Lỗi lấy danh sách đơn hàng" };
  }
};

const getOrderDetails = async (userId, orderId) => {
  try {
    await autoConfirmOrders(userId);

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order || order.userId !== parseInt(userId)) {
      return {
        EC: 1,
        EM: "Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn",
      };
    }

    return { EC: 0, data: order };
  } catch (error) {
    console.error("getOrderDetails error:", error);
    return { EC: -1, EM: "Lỗi lấy chi tiết đơn hàng" };
  }
};

const cancelOrderService = async (userId, orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: true,
      },
    });

    if (!order || order.userId !== parseInt(userId)) {
      return { EC: 1, EM: "Đơn hàng không tồn tại" };
    }

    const currentStatus = order.status;

    if (
      ["CANCELLED", "DELIVERED", "DELIVERING", "CANCEL_REQUESTED"].includes(
        currentStatus,
      )
    ) {
      return {
        EC: 2,
        EM: `Không thể hủy đơn hàng đang ở trạng thái: ${currentStatus}`,
      };
    }

    const diffInMs = Date.now() - new Date(order.createdAt).getTime();
    const diffInMinutes = diffInMs / (1000 * 60);

    if (diffInMinutes > 30) {
      return {
        EC: 3,
        EM: "Chỉ được phép hủy đơn hàng trong vòng 30 phút kể từ lúc đặt hàng thành công.",
      };
    }

    let targetStatus = "CANCELLED";
    let message = "Hủy đơn hàng thành công";

    if (currentStatus === "PREPARING") {
      targetStatus = "CANCEL_REQUESTED";
      message = "Đơn hàng đang chuẩn bị, đã gửi yêu cầu hủy đơn đến shop";
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: parseInt(orderId) },
        data: { status: targetStatus },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (targetStatus === "CANCELLED") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              sold: { decrement: item.quantity },
            },
          });
        }
      }

      return updated;
    });

    return { EC: 0, EM: message, data: updatedOrder };
  } catch (error) {
    console.error("cancelOrderService error:", error);
    return { EC: -1, EM: "Lỗi hệ thống khi hủy đơn hàng" };
  }
};

const updateOrderStatusSimulation = async (orderId, newStatus) => {
  try {
    const validStatuses = [
      "NEW",
      "CONFIRMED",
      "PREPARING",
      "DELIVERING",
      "DELIVERED",
      "CANCELLED",
      "CANCEL_REQUESTED",
    ];
    if (!validStatuses.includes(newStatus)) {
      return { EC: 1, EM: "Trạng thái đơn hàng không hợp lệ" };
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { items: true },
    });

    if (!order) {
      return { EC: 2, EM: "Đơn hàng không tồn tại" };
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: parseInt(orderId) },
        data: { status: newStatus },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              sold: { decrement: item.quantity },
            },
          });
        }
      }

      if (order.status === "CANCELLED" && newStatus !== "CANCELLED") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              sold: { increment: item.quantity },
            },
          });
        }
      }

      return updated;
    });

    return {
      EC: 0,
      EM: `Cập nhật trạng thái sang "${newStatus}" thành công`,
      data: updatedOrder,
    };
  } catch (error) {
    console.error("updateOrderStatusSimulation error:", error);
    return { EC: -1, EM: "Lỗi hệ thống khi cập nhật trạng thái" };
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrderService,
  updateOrderStatusSimulation,
};
