const { getAllProducts, getProductById, getTopProducts, seedProductsService } = require("../services/productServices");

const getProducts = async (req, res) => {
    const filters = {
        search: req.query.search,
        categoryId: req.query.categoryId,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        sortBy: req.query.sortBy,
        page: req.query.page,
        limit: req.query.limit
    };
    let results = await getAllProducts(filters);
    return res.status(200).json({
        EC: 0,
        data: results.products,
        pagination: results.pagination
    })
}

const getTop = async (req, res) => {
    let result = await getTopProducts();
    if (result) {
        return res.status(200).json({
            EC: 0,
            data: result
        })
    }
    return res.status(500).json({
        EC: 1,
        EM: "Lỗi lấy sản phẩm nổi bật"
    })
}

const getProductDetail = async (req, res) => {
    const { id } = req.params;
    let result = await getProductById(id);
    if (result) {
        return res.status(200).json({
            EC: 0,
            data: result
        })
    }
    return res.status(404).json({
        EC: 1,
        EM: "Không tìm thấy sản phẩm"
    })
}

const seedProducts = async (req, res) => {
    const data = await seedProductsService();
    return res.status(200).json(data);
}

module.exports = {
    getProducts,
    getTop,
    getProductDetail,
    seedProducts
}
