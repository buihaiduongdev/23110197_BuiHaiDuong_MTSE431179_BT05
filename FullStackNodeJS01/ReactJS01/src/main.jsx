import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegisterPage from "./pages/register.jsx";
import LoginPage from "./pages/login.jsx";
import HomePage from "./pages/home.jsx";
import UserPage from "./pages/user.jsx";
import ForgotPasswordPage from "./pages/forgot-password.jsx";
import ProductDetail from "./pages/product-detail.jsx";
import ProductsPage from "./pages/products.jsx";
import CartPage from "./pages/cart.jsx";
import CheckoutPage from "./pages/checkout.jsx";
import OrdersPage from "./pages/orders.jsx";
import { AuthWrapper } from "./components/context/auth.wrapper.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "user", element: <UserPage /> },
      { path: "product/:id", element: <ProductDetail /> },
      { path: "products", element: <ProductsPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "orders", element: <OrdersPage /> },
    ],
  },
  { path: "register", element: <RegisterPage /> },
  { path: "login", element: <LoginPage /> },
  { path: "forgot-password", element: <ForgotPasswordPage /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </React.StrictMode>,
);
