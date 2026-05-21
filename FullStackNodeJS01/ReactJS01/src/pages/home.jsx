import { useEffect, useState } from "react";
import { Col, Card, Badge, Button, Spin, notification, Tag } from "antd";
import { Link } from "react-router-dom";
import { getTopProductsApi, seedProductsApi } from "../util/api";
import heroImg from "../assets/hero.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Home = () => {
  const [topSelling, setTopSelling] = useState([]);
  const [topViewed, setTopViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const res = await getTopProductsApi();
        if (isMounted && res && res.EC === 0) {
          setTopSelling(res.data.topSelling || []);
          setTopViewed(res.data.topViewed || []);
        }
      } catch (error) {
        console.error("Error fetching top products:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopProducts();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const handleSeedData = async () => {
    const res = await seedProductsApi();
    if (res && res.EC === 0) {
      notification.success({ message: "Thành công", description: res.EM });
      setRefreshTrigger((prev) => prev + 1);
    } else {
      notification.warning({
        message: "Thông báo",
        description: res?.EM || "Không thể seed dữ liệu",
      });
    }
  };

  const renderProductCard = (product, isSlide = false) => {
    const imageSrc =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : product.image || "";

    const cardContent = (
      <Link to={`/product/${product.id}`} className="group block h-full">
        <Card
          hoverable
          className="rounded-2xl overflow-hidden border-none shadow-sm hover:shadow-xl transition-all h-full mx-1"
          cover={
            <div className="h-52 bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
              <img
                alt={product.name}
                src={imageSrc}
                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  NEW
                </div>
              )}
            </div>
          }
        >
          <div className="flex flex-col gap-2 text-left">
            <h3 className="font-bold text-lg m-0 truncate text-black!">
              {product.name}
            </h3>
            <div className="flex justify-between items-center mb-1">
              <Tag
                color="blue"
                className="m-0 text-[10px] px-1 border-none bg-blue-50 text-blue-500"
              >
                {product.category?.name || "Keyboard"}
              </Tag>
              <span className="text-[10px] text-gray-400">
                Lượt xem: {product.views || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-600 font-bold">
                ${product.price}
              </span>
              <span className="text-xs text-gray-400">
                {product.sold || 0} đã bán
              </span>
            </div>
            <Button
              type="primary"
              block
              className="mt-2 rounded-lg bg-purple-600 border-none hover:bg-purple-700 h-10"
            >
              Chi tiết
            </Button>
          </div>
        </Card>
      </Link>
    );

    if (isSlide) {
      return (
        <SwiperSlide key={product.id} className="py-2">
          {cardContent}
        </SwiperSlide>
      );
    }

    return (
      <Col xs={24} sm={12} lg={6} key={product.id}>
        {cardContent}
      </Col>
    );
  };

  const swiperConfig = {
    modules: [Navigation, Pagination],
    navigation: true,
    pagination: { clickable: true },
    spaceBetween: 20,
    slidesPerView: 1,
    breakpoints: {
      640: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 },
    },
    className: "pb-12",
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-left">
      <div className="relative rounded-3xl overflow-hidden mb-12 h-64 md:h-96 group">
        <img
          src={heroImg}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="Promotion"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8 md:px-16 text-white text-left">
          <Badge count="Sale 30%" className="mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Summer Keyboard Sale
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-md opacity-90">
            Trải nghiệm cảm giác gõ phím đỉnh cao với bộ sưu tập mới nhất.
          </p>
          <Link to="/products">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full w-fit transition-all shadow-lg">
              Khám phá ngay
            </button>
          </Link>
        </div>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-black! m-0">
              Top Sản phẩm bán chạy nhất
            </h2>
            <Link
              to="/products"
              className="text-purple-600 font-medium hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          {topSelling.length > 0 ? (
            <Swiper {...swiperConfig}>
              {topSelling.map((p) => renderProductCard(p, true))}
            </Swiper>
          ) : (
            <div className="text-center text-gray-400">Không có dữ liệu</div>
          )}
        </div>

        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-black! m-0">
              Top Sản phẩm xem nhiều nhất
            </h2>
          </div>
          {topViewed.length > 0 ? (
            <Swiper {...swiperConfig}>
              {topViewed.map((p) => renderProductCard(p, true))}
            </Swiper>
          ) : (
            <div className="text-center text-gray-400">Không có dữ liệu</div>
          )}
        </div>
      </Spin>

      <div className="mt-16 mb-8 flex justify-center">
        <Button
          type="dashed"
          onClick={handleSeedData}
          className="border-purple-200 text-purple-400 hover:text-purple-600 hover:border-purple-400 rounded-xl px-8 h-11"
        >
          Làm mới dữ liệu mẫu
        </Button>
      </div>

      <div className="mt-20 py-12 border-t border-gray-200 text-center text-gray-400">
        <p>Bùi Hải Dương - 23110197</p>
      </div>
    </div>
  );
};

export default Home;
