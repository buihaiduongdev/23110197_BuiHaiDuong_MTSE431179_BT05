const express = require("express");
const {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  handleForgotPassword,
} = require("../controllers/userController");
const { getProducts, getTop, getProductDetail, seedProducts } = require("../controllers/productController");
const {
  fetchCart,
  handleAddToCart,
  handleUpdateCartItem,
  handleDeleteCartItem,
  handleClearCart
} = require("../controllers/cartController");
const {
  handleCreateOrder,
  handleGetUserOrders,
  handleGetOrderDetails,
  handleCancelOrder,
  handleUpdateStatusSimulation
} = require("../controllers/orderController");
const auth = require("../middleware/auth");
const delay = require("../middleware/delay");

const routerAPI = express.Router();

routerAPI.get("/", (req, res) => res.status.json("Hello word api"));
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.get("/user", auth, getUser);
routerAPI.get("/account", delay, auth, getAccount);

// Products
routerAPI.get("/products", getProducts);
routerAPI.get("/products/top", getTop);
routerAPI.get("/products/:id", getProductDetail);
routerAPI.post("/seed-products", seedProducts);
routerAPI.post("/forgot-password", handleForgotPassword);

// Cart
routerAPI.get("/cart", auth, fetchCart);
routerAPI.post("/cart", auth, handleAddToCart);
routerAPI.put("/cart/item", auth, handleUpdateCartItem);
routerAPI.delete("/cart/item/:id", auth, handleDeleteCartItem);
routerAPI.delete("/cart", auth, handleClearCart);

// Orders
routerAPI.post("/orders", auth, handleCreateOrder);
routerAPI.get("/orders", auth, handleGetUserOrders);
routerAPI.get("/orders/:id", auth, handleGetOrderDetails);
routerAPI.post("/orders/:id/cancel", auth, handleCancelOrder);
routerAPI.put("/orders/:id/status", auth, handleUpdateStatusSimulation);

module.exports = routerAPI;
