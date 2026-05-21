import { useContext, useState } from "react";
import {
  HomeOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  const items = [
    {
      label: <Link to={"/"}>Home</Link>,
      key: "home",
      icon: <HomeOutlined />,
    },
    {
      label: <Link to={"/products"}>Sản phẩm</Link>,
      key: "products",
      icon: <ShoppingOutlined />,
    },
    ...(auth.isAuthenticated
      ? [
          {
            label: <Link to={"/cart"}>Giỏ hàng</Link>,
            key: "cart",
            icon: <ShoppingCartOutlined />,
          },
          {
            label: <Link to={"/orders"}>Đơn hàng</Link>,
            key: "orders",
            icon: <HistoryOutlined />,
          },
        ]
      : []),
    ...(auth.isAuthenticated && auth.user.role === "Admin"
      ? [
          {
            label: <Link to={"/user"}>Users</Link>,
            key: "user",
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),

    {
      label: `Welcome ${auth?.user?.name || ""}`,
      key: "SubMenu",
      icon: <SettingOutlined />,
      children: [
        ...(auth.isAuthenticated
          ? [
              {
                label: (
                  <span
                    onClick={() => {
                      localStorage.removeItem("access_token");
                      setAuth({
                        isAuthenticated: false,
                        user: { email: "", name: "", role: "" },
                      });
                      navigate("/");
                    }}
                  >
                    Đăng xuất
                  </span>
                ),
                key: "logout",
              },
            ]
          : [
              { label: <Link to={"/login"}>Đăng nhập</Link>, key: "login" },
              { label: <Link to={"/register"}>Đăng ký</Link>, key: "register" },
            ]),
      ],
    },
  ];

  const [current, setCurrent] = useState("mail");
  const onClick = (e) => {
    console.log("click", e);
    setCurrent(e.key);
  };

  return (
    <Menu
      onClick={onClick}
      selectedKeys={current}
      mode="horizontal"
      items={items}
    />
  );
};

export default Header;
