const {
  getOrCreateCart,
  addToCart,
  updateCartItemQuantity,
  deleteCartItem,
  clearCartService
} = require("../services/cartServices");

const fetchCart = async (req, res) => {
  const userId = req.user.id;
  const result = await getOrCreateCart(userId);
  if (result.EC === 0) {
    return res.status(200).json(result);
  }
  return res.status(500).json(result);
};

const handleAddToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ EC: 1, EM: "Thiếu thông tin sản phẩm hoặc số lượng" });
  }

  const result = await addToCart(userId, productId, parseInt(quantity));
  if (result.EC === 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json(result);
};

const handleUpdateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { cartItemId, quantity } = req.body;

  if (!cartItemId || quantity === undefined) {
    return res.status(400).json({ EC: 1, EM: "Thiếu thông tin cập nhật" });
  }

  const result = await updateCartItemQuantity(userId, cartItemId, parseInt(quantity));
  if (result.EC === 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json(result);
};

const handleDeleteCartItem = async (req, res) => {
  const userId = req.user.id;
  const cartItemId = req.params.id;

  if (!cartItemId) {
    return res.status(400).json({ EC: 1, EM: "Thiếu id sản phẩm cần xóa" });
  }

  const result = await deleteCartItem(userId, cartItemId);
  if (result.EC === 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json(result);
};

const handleClearCart = async (req, res) => {
  const userId = req.user.id;
  const result = await clearCartService(userId);
  if (result.EC === 0) {
    return res.status(200).json(result);
  }
  return res.status(500).json(result);
};

module.exports = {
  fetchCart,
  handleAddToCart,
  handleUpdateCartItem,
  handleDeleteCartItem,
  handleClearCart
};
