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
