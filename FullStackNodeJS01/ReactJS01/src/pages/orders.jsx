import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Button,
  Spin,
  notification,
  Popconfirm,
  Row,
  Col,
  Steps,
  Divider,
  Space,
  Select,
} from "antd";
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getUserOrdersApi,
  cancelOrderApi,
  updateOrderStatusSimulationApi,
} from "../util/api";
import { AuthContext } from "../components/context/auth.context";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      notification.warning({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để xem lịch sử đơn hàng!",
      });
      navigate("/login");
      return;
    }

    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const res = await getUserOrdersApi();
        if (isMounted) {
          if (res && res.EC === 0) {
            setOrders(res.data);
          } else {
            notification.error({
              message: "Lỗi",
              description: res.EM || "Không thể tải danh sách đơn hàng",
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error(error);
          notification.error({
            message: "Lỗi",
            description: "Đã xảy ra lỗi khi tải danh sách đơn hàng",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [auth.isAuthenticated]);

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await cancelOrderApi(orderId);
      if (res && res.EC === 0) {
        notification.success({
          message: "Thông báo",
          description: res.EM || "Hủy đơn hàng thành công!",
        });
        if (res.data) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? res.data : o)),
          );
        }
      } else {
        notification.error({
          message: "Lỗi",
          description: res.EM || "Không thể hủy đơn hàng",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Lỗi kết nối hoặc lỗi server." + error,
      });
    }
  };

  const handleSimulateStatus = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatusSimulationApi(orderId, newStatus);
      if (res && res.EC === 0) {
        notification.success({
          message: "Thành công (Mô phỏng)",
          description: res.EM || "Cập nhật trạng thái đơn hàng thành công!",
        });
        if (res.data) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? res.data : o)),
          );
        }
      } else {
        notification.error({
          message: "Lỗi",
          description: res.EM || "Không thể cập nhật trạng thái",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Lỗi kết nối hoặc lỗi server." + error,
      });
    }
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "NEW":
        return { color: "blue", label: "Đơn hàng mới", step: 0 };
      case "CONFIRMED":
        return { color: "cyan", label: "Đã xác nhận", step: 1 };
      case "PREPARING":
        return { color: "orange", label: "Đang chuẩn bị hàng", step: 2 };
      case "DELIVERING":
        return { color: "purple", label: "Đang giao hàng", step: 3 };
      case "DELIVERED":
        return { color: "green", label: "Đã giao thành công", step: 4 };
      case "CANCELLED":
        return { color: "red", label: "Đã hủy đơn", step: -1 };
      case "CANCEL_REQUESTED":
        return { color: "magenta", label: "Yêu cầu hủy đơn", step: -2 };
      default:
        return { color: "default", label: "Không xác định", step: 0 };
    }
  };

  const checkCancelCondition = (order) => {
    const elapsedMinutes =
      (currentTime - new Date(order.createdAt).getTime()) / (1000 * 60);
    const isWithin30Mins = elapsedMinutes <= 30;
    const isCancelableStatus = ["NEW", "CONFIRMED", "PREPARING"].includes(
      order.status,
    );

    return {
      canCancel: isWithin30Mins && isCancelableStatus,
      minutesLeft: Math.max(0, Math.ceil(30 - elapsedMinutes)),
      isPreparing: order.status === "PREPARING",
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" tip="Đang tải lịch sử mua hàng..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-left">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900! mb-8 flex items-center gap-3">
          <ShoppingOutlined className="text-purple-600" /> Lịch sử đơn hàng &
          Theo dõi
        </h1>

        {orders.length === 0 ? (
          <Card className="rounded-3xl border border-dashed border-gray-200 text-center py-20 shadow-sm">
            <Space direction="vertical" size="large">
              <div className="text-6xl opacity-30">📦</div>
              <div className="text-xl text-gray-500 font-medium">
                Bạn chưa mua đơn hàng nào!
              </div>
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
          <div className="flex flex-col gap-6">
            {orders.map((order) => {
              const { color, label, step } = getStatusDetails(order.status);
              const { canCancel, minutesLeft, isPreparing } =
                checkCancelCondition(order);

              const stepItems = [
                { title: "Mới" },
                { title: "Xác nhận" },
                { title: "Chuẩn bị" },
                { title: "Đang giao" },
                { title: "Đã nhận" },
              ];

              return (
                <Card
                  key={order.id}
                  className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  title={
                    <div className="flex flex-wrap justify-between items-center gap-2 py-1">
                      <span className="font-bold text-gray-800">
                        Mã đơn: #{order.id}
                      </span>
                      <Space>
                        <span className="text-gray-400 text-xs font-normal">
                          Ngày đặt:{" "}
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </span>
                        <Tag
                          color={color}
                          className="font-semibold text-xs py-0.5 px-2.5 rounded-full border-none"
                        >
                          {label}
                        </Tag>
                      </Space>
                    </div>
                  }
                >
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={16}>
                      <div className="flex flex-col gap-4">
                        {order.items.map((item) => {
                          const imageSrc =
                            Array.isArray(item.product.images) &&
                            item.product.images.length > 0
                              ? item.product.images[0]
                              : item.product.image || "";
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-4"
                            >
                              <div className="w-12 h-12 bg-gray-50 flex items-center justify-center p-1 rounded border border-gray-100 overflow-hidden">
                                <img
                                  src={imageSrc}
                                  alt={item.product.name}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 text-sm">
                                  {item.product.name}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  Số lượng: {item.quantity} | Đơn giá: $
                                  {item.price}
                                </div>
                              </div>
                              <div className="font-bold text-gray-800 text-sm">
                                ${item.price * item.quantity}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Divider className="my-6" />

                      <Row gutter={[16, 16]} className="text-sm">
                        <Col xs={24} sm={12}>
                          <div className="flex gap-2">
                            <CompassOutlined className="text-purple-600 mt-1" />
                            <div>
                              <div className="font-bold text-gray-700">
                                Địa chỉ giao hàng
                              </div>
                              <div className="text-gray-500">
                                {order.shippingAddress}
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div className="flex gap-2">
                            <DollarOutlined className="text-purple-600 mt-1" />
                            <div>
                              <div className="font-bold text-gray-700">
                                Thanh toán
                              </div>
                              <div className="text-gray-500">
                                {order.paymentMethod} (COD)
                              </div>
                              <div className="text-purple-600 font-extrabold text-lg mt-1">
                                Tổng cộng: ${order.totalPrice}
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Col>

                    <Col
                      xs={24}
                      md={8}
                      className="border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                          <ClockCircleOutlined className="text-purple-600" />{" "}
                          Trạng thái vận đơn
                        </div>

                        {step >= 0 ? (
                          <Steps
                            direction="vertical"
                            current={step}
                            size="small"
                            items={stepItems}
                            className="custom-steps"
                          />
                        ) : (
                          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-2 items-start">
                            <ExclamationCircleOutlined className="text-red-500 mt-0.5" />
                            <div>
                              <div className="font-bold text-red-700">
                                {label}
                              </div>
                              <p className="text-red-600 text-xs m-0">
                                {order.status === "CANCEL_REQUESTED"
                                  ? "Yêu cầu hủy đơn đã gửi tới cửa hàng. Đang chờ phê duyệt."
                                  : "Đơn hàng này đã bị hủy bỏ."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-50">
                        {canCancel && (
                          <Popconfirm
                            title={
                              isPreparing
                                ? "Gửi yêu cầu hủy đơn?"
                                : "Xác nhận hủy đơn hàng?"
                            }
                            description={
                              isPreparing
                                ? `Hàng đang chuẩn bị, bạn có muốn gửi yêu cầu hủy đơn cho shop không? (Còn lại ${minutesLeft} phút)`
                                : `Đơn hàng sẽ được hủy ngay lập tức. Bạn có chắc không? (Còn lại ${minutesLeft} phút)`
                            }
                            onConfirm={() => handleCancelOrder(order.id)}
                            okText={isPreparing ? "Gửi yêu cầu" : "Hủy đơn"}
                            cancelText="Quay lại"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              danger
                              block
                              className="rounded-xl h-10 mb-4 font-semibold"
                            >
                              {isPreparing ? "Yêu cầu hủy đơn" : "Hủy đơn hàng"}{" "}
                              (Còn {minutesLeft}m)
                            </Button>
                          </Popconfirm>
                        )}

                        {/* Student Simulation Controls */}
                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                          <div className="text-purple-700 text-xs font-bold mb-2">
                            Simulate Shop/Shipper Actions:
                          </div>
                          <Select
                            placeholder="Chuyển đổi trạng thái đơn"
                            className="w-full"
                            value={order.status}
                            onChange={(val) =>
                              handleSimulateStatus(order.id, val)
                            }
                            options={[
                              { value: "NEW", label: "1. Đơn hàng mới" },
                              { value: "CONFIRMED", label: "2. Đã xác nhận" },
                              {
                                value: "PREPARING",
                                label: "3. Đang chuẩn bị hàng",
                              },
                              {
                                value: "DELIVERING",
                                label: "4. Đang giao hàng",
                              },
                              {
                                value: "DELIVERED",
                                label: "5. Đã giao thành công",
                              },
                              {
                                value: "CANCELLED",
                                label: "6. Hủy đơn hàng (Cancelled)",
                              },
                              {
                                value: "CANCEL_REQUESTED",
                                label: "7. Yêu cầu hủy đơn",
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
