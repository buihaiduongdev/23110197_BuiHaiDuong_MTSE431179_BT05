import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  InputNumber,
  notification,
  Popconfirm,
  Spin,
  Card,
  Row,
  Col,
  Space,
  Divider,
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { getCartApi, updateCartItemApi, deleteCartItemApi } from "../util/api";
import { AuthContext } from "../components/context/auth.context";

const CartPage = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      notification.warning({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để xem giỏ hàng!",
      });
      navigate("/login");
      return;
    }

    let isMounted = true;
    const fetchCartData = async () => {
      try {
        const res = await getCartApi();
        if (isMounted) {
          if (res && res.EC === 0) {
            setCart(res.data);
          } else {
            notification.error({
              message: "Lỗi",
              description: res.EM || "Không thể tải giỏ hàng",
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error(error);
          notification.error({
            message: "Lỗi",
            description: "Đã xảy ra lỗi khi tải giỏ hàng",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCartData();
    return () => {
      isMounted = false;
    };
  }, [auth.isAuthenticated]);

  const handleQuantityChange = async (itemId, value) => {
    if (value === null || value === undefined) return;
    try {
      const res = await updateCartItemApi(itemId, value);
      if (res && res.EC === 0) {
        setCart(res.data);
      } else {
        notification.error({
          message: "Lỗi",
          description: res.EM || "Không thể cập nhật số lượng",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Lỗi kết nối đến máy chủ" + error,
      });
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await deleteCartItemApi(itemId);
      if (res && res.EC === 0) {
        notification.success({
          message: "Thành công",
          description: "Đã xóa sản phẩm khỏi giỏ hàng",
        });
        setCart(res.data);
      } else {
        notification.error({
          message: "Lỗi",
          description: res.EM || "Không thể xóa sản phẩm",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Lỗi kết nối đến máy chủ" + error,
      });
    }
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
      render: (product) => {
        const imageSrc =
          Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : product.image || "";
        return (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 flex items-center justify-center p-2 rounded-lg border border-gray-100 overflow-hidden">
              <img
                src={imageSrc}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-gray-800 text-sm md:text-base">
                {product.name}
              </div>
              <div className="text-gray-400 text-xs">
                {product.category?.name || "Bàn phím"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Đơn giá",
      dataIndex: ["product", "price"],
      key: "price",
      render: (price) => (
        <span className="font-semibold text-gray-700">${price}</span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={record.product.stock}
          value={quantity}
          onChange={(val) => handleQuantityChange(record.id, val)}
          className="rounded-lg h-9 flex items-center w-20"
        />
      ),
    },
    {
      title: "Tổng cộng",
      key: "total",
      render: (_, record) => (
        <span className="font-bold text-purple-600">
          ${record.product.price * record.quantity}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Xóa khỏi giỏ hàng?"
          description="Bạn có chắc chắn muốn xóa sản phẩm này?"
          onConfirm={() => handleDeleteItem(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="hover:bg-red-50 rounded-lg"
          />
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" tip="Đang tải giỏ hàng..." />
      </div>
    );
  }

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-left">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Link
            to="/products"
            className="text-gray-500 hover:text-purple-600 transition-all flex items-center gap-1 font-medium"
          >
            <ArrowLeftOutlined /> Tiếp tục mua sắm
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900! mb-8 flex items-center gap-3">
          <ShoppingCartOutlined className="text-purple-600" /> Giỏ hàng của bạn
        </h1>

        {!hasItems ? (
          <Card className="rounded-3xl border border-dashed border-gray-200 text-center py-20 shadow-sm">
            <Space direction="vertical" size="large">
              <div className="text-6xl opacity-30">🛒</div>
              <div className="text-xl text-gray-500 font-medium">
                Giỏ hàng của bạn đang trống!
              </div>
              <p className="text-gray-400 max-w-md mx-auto">
                Hãy quay lại cửa hàng để khám phá và lựa chọn các mẫu bàn phím
                cơ, keycaps cùng phụ kiện cao cấp nhất nhé.
              </p>
              <Link to="/products">
                <Button
                  type="primary"
                  size="large"
                  className="bg-purple-600 border-none hover:bg-purple-700 rounded-xl px-8 h-12 text-base font-semibold"
                >
                  Mua sắm ngay
                </Button>
              </Link>
            </Space>
          </Card>
        ) : (
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-0">
                <Table
                  dataSource={cart.items}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  className="custom-table"
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card className="rounded-2xl border border-gray-100 shadow-sm sticky top-8">
                <h3 className="font-bold text-xl text-gray-800! mb-6">
                  Tóm tắt đơn hàng
                </h3>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-semibold text-gray-800">
                    ${calculateSubtotal()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>

                <Divider className="my-4" />

                <div className="flex justify-between items-center mb-8">
                  <span className="font-bold text-lg text-gray-800">
                    Tổng cộng
                  </span>
                  <span className="font-extrabold text-2xl text-purple-600">
                    ${calculateSubtotal()}
                  </span>
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<CreditCardOutlined />}
                  onClick={() => navigate("/checkout")}
                  className="bg-purple-600 border-none hover:bg-purple-700 h-14 rounded-xl text-lg font-bold shadow-lg shadow-purple-100"
                >
                  Tiến hành thanh toán
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default CartPage;
