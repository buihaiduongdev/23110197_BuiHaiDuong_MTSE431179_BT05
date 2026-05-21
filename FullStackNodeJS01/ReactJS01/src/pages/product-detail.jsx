import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  InputNumber,
  Badge,
  Tag,
  Divider,
  Spin,
  notification,
  Card,
  Rate,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  TruckOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { getProductDetailApi, getProductsApi, addToCartApi } from "../util/api";
import { AuthContext } from "../components/context/auth.context";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const handleAddToCart = async () => {
    if (!auth.isAuthenticated) {
      notification.warning({
        message: "Thông báo",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!"
      });
      navigate("/login");
      return;
    }

    try {
      const res = await addToCartApi(id, quantity);
      if (res && res.EC === 0) {
        notification.success({
          message: "Thành công",
          description: "Đã thêm sản phẩm vào giỏ hàng!"
        });
      } else {
        notification.error({
          message: "Thất bại",
          description: res.EM || "Không thể thêm sản phẩm vào giỏ hàng"
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Đã xảy ra lỗi"
      });
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getProductDetailApi(id);
        if (res && res.EC === 0) {
          setProduct(res.data);
          if (res.data.categoryId) {
            const relatedRes = await getProductsApi({
              categoryId: res.data.categoryId,
            });
            if (relatedRes && relatedRes.EC === 0) {
              setRelatedProducts(
                relatedRes.data
                  .filter((p) => p.id !== parseInt(id))
                  .slice(0, 4),
              );
            }
          }
        }
      } catch (e) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải thông tin sản phẩm" + e,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  if (!product)
    return <div className="text-center mt-20">Không tìm thấy sản phẩm</div>;

  const images = product.images || [product.image];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 bg-white min-h-screen text-left">
      <Row gutter={[48, 48]}>
        <Col xs={24} lg={12}>
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-4">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full aspect-square rounded-xl"
            >
              {images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Tag color="purple">
                  {product.category?.name || "Uncategorized"}
                </Tag>
                {product.isHot && <Badge status="error" text="Bán chạy" />}
              </div>
              <h1 className="text-4xl font-bold text-gray-900! mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <Rate disabled defaultValue={5} className="text-sm" />
                <span className="text-gray-400">({product.sold} đã bán)</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-purple-600">
              ${product.price}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-600">
              <p className="mb-0">
                {product.description || "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">Số lượng:</span>
                <InputNumber
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={setQuantity}
                  className="rounded-lg h-10 flex items-center"
                />
                <span className="text-gray-400">
                  {product.stock} sản phẩm có sẵn
                </span>
              </div>

              <div className="flex gap-4 mt-2">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  className="h-14 flex-1 bg-purple-600 border-none rounded-xl text-lg font-bold hover:bg-purple-700"
                >
                  Thêm vào giỏ hàng
                </Button>
                <Button
                  size="large"
                  icon={<HeartOutlined />}
                  className="h-14 w-14 flex items-center justify-center rounded-xl border-gray-200"
                />
              </div>
            </div>

            <Divider className="my-2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <SafetyCertificateOutlined className="text-purple-600 text-lg" />
                <span>Bảo hành chính hãng 12 tháng</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <TruckOutlined className="text-purple-600 text-lg" />
                <span>Miễn phí vận chuyển từ $500</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <ReloadOutlined className="text-purple-600 text-lg" />
                <span>7 ngày đổi trả dễ dàng</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900! mb-8 text-left">
            Sản phẩm tương tự
          </h2>
          <Row gutter={[24, 24]}>
            {relatedProducts.map((p) => (
              <Col xs={24} sm={12} lg={6} key={p.id}>
                <Link to={`/product/${p.id}`}>
                  <Card
                    hoverable
                    className="rounded-2xl overflow-hidden border-none shadow-sm hover:shadow-lg transition-all"
                    cover={
                      <div className="h-48 bg-gray-50 flex items-center justify-center p-4">
                        <img
                          alt={p.name}
                          src={Array.isArray(p.images) ? p.images[0] : p.image}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    }
                  >
                    <div className="flex flex-col gap-1 text-left">
                      <h4 className="font-bold text-gray-800! m-0 truncate">
                        {p.name}
                      </h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-purple-600 font-bold">
                          ${p.price}
                        </span>
                        <span className="text-xs text-gray-400">
                          {p.sold} đã bán
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
