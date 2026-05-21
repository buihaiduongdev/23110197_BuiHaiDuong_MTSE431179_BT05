import axios from "./axios.customize";

export const createUserApi = (name, email, password, role) => {
  return axios.post("/v1/api/register", { name, email, password, role });
};
export const loginApi = (email, password) => {
  return axios.post("/v1/api/login", { email, password });
};
export const getUserApi = () => {
  return axios.get("/v1/api/user");
};
export const forgotPasswordApi = (email, oldPassword, newPassword) => {
  return axios.post("/v1/api/forgot-password", {
    email,
    oldPassword,
    newPassword,
  });
};
export const getProductsApi = (params) => {
  return axios.get("/v1/api/products", { params });
};
export const getTopProductsApi = () => {
  return axios.get("/v1/api/products/top");
};
export const getProductDetailApi = (id) => {
  return axios.get(`/v1/api/products/${id}`);
};
export const seedProductsApi = () => {
  return axios.post("/v1/api/seed-products");
};

// Cart APIs
export const getCartApi = () => {
  return axios.get("/v1/api/cart");
};
export const addToCartApi = (productId, quantity) => {
  return axios.post("/v1/api/cart", { productId, quantity });
};
export const updateCartItemApi = (cartItemId, quantity) => {
  return axios.put("/v1/api/cart/item", { cartItemId, quantity });
};
export const deleteCartItemApi = (cartItemId) => {
  return axios.delete(`/v1/api/cart/item/${cartItemId}`);
};
export const clearCartApi = () => {
  return axios.delete("/v1/api/cart");
};

// Order APIs
export const createOrderApi = (paymentMethod, shippingAddress, phone) => {
  return axios.post("/v1/api/orders", { paymentMethod, shippingAddress, phone });
};
export const getUserOrdersApi = () => {
  return axios.get("/v1/api/orders");
};
export const getOrderDetailsApi = (orderId) => {
  return axios.get(`/v1/api/orders/${orderId}`);
};
export const cancelOrderApi = (orderId) => {
  return axios.post(`/v1/api/orders/${orderId}/cancel`);
};
export const updateOrderStatusSimulationApi = (orderId, status) => {
  return axios.put(`/v1/api/orders/${orderId}/status`, { status });
};
