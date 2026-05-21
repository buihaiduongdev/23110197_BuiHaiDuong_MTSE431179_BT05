const { prisma } = require("../config/database");

const getOrCreateCart = async (userId) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: parseInt(userId) },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return { EC: 0, data: cart };
  } catch (error) {
    console.error("getOrCreateCart error:", error);
    return { EC: -1, EM: "Lỗi lấy thông tin giỏ hàng" };
  }
};

const addToCart = async (userId, productId, quantity) => {
  try {
    // 1. Get or create user's cart
    const cartResult = await getOrCreateCart(userId);
    if (cartResult.EC !== 0) return cartResult;
    const cart = cartResult.data;

    // 2. Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return { EC: 1, EM: "Sản phẩm không tồn tại" };
    }

    if (product.stock < quantity) {
      return { EC: 2, EM: `Sản phẩm chỉ còn ${product.stock} trong kho` };
    }

    // 3. Add or update quantity
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parseInt(productId),
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return {
          EC: 2,
          EM: `Sản phẩm chỉ còn ${product.stock} trong kho. Bạn đang có ${existingItem.quantity} trong giỏ.`,
        };
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: quantity,
        },
      });
    }

    const updatedCart = await getOrCreateCart(userId);
    return {
      EC: 0,
      EM: "Thêm vào giỏ hàng thành công",
      data: updatedCart.data,
    };
  } catch (error) {
    console.error("addToCart error:", error);
    return { EC: -1, EM: "Lỗi thêm sản phẩm vào giỏ hàng" };
  }
};

const updateCartItemQuantity = async (userId, cartItemId, quantity) => {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: parseInt(cartItemId) },
      include: {
        product: true,
        cart: true,
      },
    });

    if (!item || item.cart.userId !== parseInt(userId)) {
      return { EC: 1, EM: "Sản phẩm trong giỏ hàng không hợp lệ" };
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: parseInt(cartItemId) } });
      const updatedCart = await getOrCreateCart(userId);
      return {
        EC: 0,
        EM: "Đã xóa sản phẩm khỏi giỏ hàng",
        data: updatedCart.data,
      };
    }

    if (item.product.stock < quantity) {
      return { EC: 2, EM: `Sản phẩm chỉ còn ${item.product.stock} trong kho` };
    }

    await prisma.cartItem.update({
      where: { id: parseInt(cartItemId) },
      data: { quantity: parseInt(quantity) },
    });

    const updatedCart = await getOrCreateCart(userId);
    return {
      EC: 0,
      EM: "Cập nhật số lượng thành công",
      data: updatedCart.data,
    };
  } catch (error) {
    console.error("updateCartItemQuantity error:", error);
    return { EC: -1, EM: "Lỗi cập nhật giỏ hàng" };
  }
};

const deleteCartItem = async (userId, cartItemId) => {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: parseInt(cartItemId) },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== parseInt(userId)) {
      return { EC: 1, EM: "Sản phẩm không hợp lệ" };
    }

    await prisma.cartItem.delete({ where: { id: parseInt(cartItemId) } });

    const updatedCart = await getOrCreateCart(userId);
    return {
      EC: 0,
      EM: "Xóa sản phẩm khỏi giỏ hàng thành công",
      data: updatedCart.data,
    };
  } catch (error) {
    console.error("deleteCartItem error:", error);
    return { EC: -1, EM: "Lỗi xóa sản phẩm khỏi giỏ hàng" };
  }
};

const clearCartService = async (userId) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { EC: 0, EM: "Đã làm trống giỏ hàng" };
  } catch (error) {
    console.error("clearCartService error:", error);
    return { EC: -1, EM: "Lỗi làm trống giỏ hàng" };
  }
};

module.exports = {
  getOrCreateCart,
  addToCart,
  updateCartItemQuantity,
  deleteCartItem,
  clearCartService,
};
