const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrderService,
  updateOrderStatusSimulation,
} = require("../services/orderServices");

const handleCreateOrder = async (req, res) => {
  const userId = req.user.id;
  const { paymentMethod, shippingAddress, phone } = req.body;

  const result = await createOrder(
    userId,
    paymentMethod,
    shippingAddress,
    phone,
  );
  if (result.EC === 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json(result);
};

const handleGetUserOrders = async (req, res) => {
  const userId = req.user.id;
  const result = await getUserOrders(userId);
  if (result.EC === 0) {
    return res.status(200).json(result);
  }
  return res.status(500).json(result);
};

const handleGetOrderDetails = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  const result = await getOrderDetails(userId, orderId);
  if (result.EC === 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json(result);
};

const handleCancelOrder = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  const result = await cancelOrderService(userId, orderId);
  if (result.EC === 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json(result);
};

const handleUpdateStatusSimulation = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res
      .status(400)
      .json({ EC: 1, EM: "Thiếu thông tin trạng thái mới" });
  }

  const result = await updateOrderStatusSimulation(orderId, status);
  if (result.EC === 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json(result);
};

module.exports = {
  handleCreateOrder,
  handleGetUserOrders,
  handleGetOrderDetails,
  handleCancelOrder,
  handleUpdateStatusSimulation,
};
