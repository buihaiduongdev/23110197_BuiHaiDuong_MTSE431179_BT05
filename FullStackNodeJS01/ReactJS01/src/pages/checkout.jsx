import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Divider,
  Radio,
  notification,
  Spin,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  PhoneOutlined,
  HomeOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { getCartApi, createOrderApi } from "../util/api";
import { AuthContext } from "../components/context/auth.context";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      notification.warning({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thanh toán đơn hàng!",
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
            if (!res.data.items || res.data.items.length === 0) {
              notification.warning({
                message: "Giỏ hàng trống",
                description:
                  "Bạn cần có sản phẩm trong giỏ hàng để thực hiện thanh toán.",
              });
              navigate("/products");
            }
          } else {
            notification.error({
              message: "Lỗi",
              description: res.EM || "Không thể tải giỏ hàng",
            });
            navigate("/cart");
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error(error);
          notification.error({
            message: "Lỗi",
            description: "Đã xảy ra lỗi khi tải giỏ hàng",
          });
          navigate("/cart");
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

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const { phone, shippingAddress, paymentMethod } = values;
      const res = await createOrderApi(paymentMethod, shippingAddress, phone);
      if (res && res.EC === 0) {
        notification.success({
          message: "Đặt hàng thành công!",
          description: res.EM || "Đơn hàng của bạn đã được tiếp nhận và xử lý.",
        });
        navigate("/orders");
      } else {
        notification.error({
          message: "Đặt hàng thất bại",
          description: res.EM || "Có lỗi xảy ra, vui lòng thử lại.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Lỗi kết nối hoặc lỗi server." + error,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
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
      render: (product, record) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-50 flex items-center justify-center p-1 rounded border border-gray-100 overflow-hidden">
            <img
              src={
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : product.image || ""
              }
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-xs md:text-sm">
              {product.name}
            </div>
            <div className="text-gray-400 text-[10px]">x{record.quantity}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Giá",
      key: "price",
      align: "right",
      render: (_, record) => (
        <span className="font-semibold text-gray-700 text-xs md:text-sm">
          ${record.product.price * record.quantity}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" tip="Đang tải thông tin thanh toán..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-left">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            to="/cart"
            className="text-gray-500 hover:text-purple-600 transition-all flex items-center gap-1 font-medium"
          >
            <ArrowLeftOutlined /> Quay lại giỏ hàng
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900! mb-8">
          Thanh toán đơn hàng
        </h1>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={14}>
            <Card className="rounded-2xl border border-gray-100 shadow-sm p-2">
              <h3 className="font-bold text-xl text-gray-800! mb-6 flex items-center gap-2">
                <SafetyOutlined className="text-purple-600" /> Thông tin nhận
                hàng
              </h3>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ paymentMethod: "COD" }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Họ và tên người nhận"
                      name="receiverName"
                      initialValue={auth.user?.name || ""}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên người nhận",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nguyễn Văn A"
                        className="rounded-xl h-11"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại",
                        },
                        {
                          pattern: /^[0-9]{9,11}$/,
                          message: "Số điện thoại không hợp lệ (9 - 11 chữ số)",
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined className="text-gray-400" />}
                        placeholder="09xxxxxxxx"
                        className="rounded-xl h-11"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Địa chỉ giao hàng"
                  name="shippingAddress"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập địa chỉ giao hàng",
                    },
                  ]}
                >
                  <Input.TextArea
                    prefix={<HomeOutlined />}
                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                    rows={3}
                    className="rounded-xl"
                  />
                </Form.Item>

                <Divider className="my-6" />

                <h3 className="font-bold text-xl text-gray-800! mb-6 flex items-center gap-2">
                  <DollarOutlined className="text-purple-600" /> Phương thức
                  thanh toán
                </h3>

                <Form.Item name="paymentMethod" initialValue="COD">
                  <Radio.Group className="w-full flex flex-col gap-3" onChange={(e) => setPaymentMethod(e.target.value)}>
                    <label className={`border rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all ${
                      paymentMethod === "COD" ? "border-purple-600 bg-purple-50/10" : "border-gray-200 hover:border-purple-600"
                    }`}>
                      <Radio value="COD" className="mt-1" />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-gray-800 text-sm">
                          COD (Thanh toán khi nhận hàng)
                        </span>
                        <span className="text-gray-400 text-xs font-normal mt-1">
                          Nhận hàng rồi mới thanh toán tiền mặt vô cùng an toàn.
                        </span>
                      </div>
                    </label>
                    <label className="border border-gray-100 rounded-2xl p-4 flex items-start gap-4 opacity-50 cursor-not-allowed">
                      <Radio value="VNPAY" disabled className="mt-1" />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-gray-800 text-sm">
                          Ví điện tử VNPAY / Momo
                        </span>
                        <span className="text-gray-400 text-xs font-normal mt-1">
                          Thanh toán trực tuyến nhanh chóng (Sắp ra mắt).
                        </span>
                      </div>
                    </label>
                  </Radio.Group>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={submitting}
                  className="bg-purple-600 border-none hover:bg-purple-700 h-14 rounded-xl text-lg font-bold shadow-lg shadow-purple-100 mt-6"
                >
                  Xác nhận đặt hàng (${calculateTotal()})
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card className="rounded-2xl border border-gray-100 shadow-sm sticky top-8 p-2">
              <h3 className="font-bold text-xl text-gray-800! mb-6 flex items-center gap-2">
                <ShoppingCartOutlined className="text-purple-600!" /> Tóm tắt
                đơn hàng
              </h3>

              <Table
                dataSource={cart.items}
                columns={columns}
                rowKey="id"
                pagination={false}
                showHeader={false}
                className="custom-table mb-6"
              />

              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500">Tạm tính</span>
                <span className="font-semibold text-gray-800">
                  ${calculateTotal()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span className="font-semibold text-green-600">Miễn phí</span>
              </div>

              <Divider className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg text-gray-800">
                  Tổng thanh toán
                </span>
                <span className="font-extrabold text-2xl text-purple-600">
                  ${calculateTotal()}
                </span>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutPage;
