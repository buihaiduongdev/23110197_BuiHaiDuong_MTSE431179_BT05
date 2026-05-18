import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Spin,
  Input,
  Select,
  Slider,
  Space,
  Tag,
  Pagination,
} from "antd";
import { Link } from "react-router-dom";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { getProductsApi } from "../util/api";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("createdAt_desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await getProductsApi({
          search,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sortBy,
          page: currentPage,
          limit: pageSize,
        });
        if (isMounted && res && res.EC === 0) {
          setProducts(res.data);
          setTotalProducts(res.pagination?.total || 0);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [search, priceRange, sortBy, currentPage, pageSize]);


  const renderProductCard = (product) => {
    const imageSrc =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : product.image || "";

    return (
      <Col xs={24} sm={12} lg={6} key={product.id}>
        <Link to={`/product/${product.id}`} className="group">
          <Card
            hoverable
            className="rounded-2xl overflow-hidden border-none shadow-sm hover:shadow-xl transition-all h-full"
            cover={
              <div className="h-56 bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
                <img
                  alt={product.name}
                  src={imageSrc}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
                {product.isNew && (
                  <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    NEW
                  </div>
                )}
              </div>
            }
          >
            <div className="flex flex-col gap-2 text-left">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg m-0 truncate w-3/4 text-black!">
                  {product.name}
                </h3>
                <span className="text-purple-600 font-bold">
                  ${product.price}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <Tag
                  color="blue"
                  className="m-0 border-none bg-blue-50 text-blue-500"
                >
                  {product.category?.name || "Keyboard"}
                </Tag>
                <span>{product.sold || 0} đã bán</span>
              </div>
              <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px] m-0">
                {product.description}
              </p>
              <Button
                type="primary"
                block
                className="mt-2 rounded-lg bg-purple-600 border-none hover:bg-purple-700 h-10 font-medium"
              >
                Chi tiết
              </Button>
            </div>
          </Card>
        </Link>
      </Col>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-left">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900!">Tất cả sản phẩm</h1>
        <p className="text-gray-500">
          Khám phá bộ sưu tập bàn phím cơ và phụ kiện cao cấp.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-12 border border-gray-100">
        <Row gutter={[24, 24]} align="bottom">
          <Col xs={24} md={8}>
            <div className="text-gray-500 mb-2 font-medium">Tìm kiếm</div>
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Nhập tên sản phẩm..."
              size="large"
              className="rounded-xl border-gray-200 h-11"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </Col>
          <Col xs={24} md={8}>
            <div className="text-gray-500 mb-2 font-medium">Khoảng giá ($)</div>
            <div className="px-2">
              <Slider
                range
                max={1000}
                defaultValue={[0, 1000]}
                onAfterChange={(val) => {
                  setPriceRange(val);
                  setCurrentPage(1);
                }}
                trackStyle={[{ backgroundColor: "#9333ea" }]}
                handleStyle={[
                  { borderColor: "#9333ea" },
                  { borderColor: "#9333ea" },
                ]}
              />
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-gray-500 mb-2 font-medium">Sắp xếp</div>
            <Select
              className="w-full h-11 rounded-xl"
              value={sortBy}
              onChange={(val) => {
                setSortBy(val);
                setCurrentPage(1);
              }}
              options={[
                { value: "createdAt_desc", label: "Mới nhất" },
                { value: "price_asc", label: "Giá thấp đến cao" },
                { value: "price_desc", label: "Giá cao đến thấp" },
              ]}
            />
          </Col>
        </Row>
      </div>

      {/* Products Grid */}
      <Spin spinning={loading} tip="Đang tải sản phẩm...">
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-black! m-0">Danh sách</h2>
            <div className="flex items-center gap-2 text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100">
              <FilterOutlined />
              <span>Tìm thấy {totalProducts} sản phẩm</span>
            </div>
          </div>
          <Row gutter={[24, 24]}>{products.map(renderProductCard)}</Row>

          {products.length > 0 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                current={currentPage}
                total={totalProducts}
                pageSize={pageSize}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showSizeChanger
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} sản phẩm`
                }
                className="custom-pagination"
              />
            </div>
          )}

          {products.length === 0 && !loading && (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
              <Space direction="vertical" size="large">
                <div className="text-5xl opacity-20">🔍</div>
                <div className="text-lg">Không tìm thấy sản phẩm phù hợp.</div>
                <Button
                  type="link"
                  onClick={() => {
                    setSearch("");
                    setPriceRange([0, 1000]);
                    setSortBy("createdAt_desc");
                    setCurrentPage(1);
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default ProductsPage;
