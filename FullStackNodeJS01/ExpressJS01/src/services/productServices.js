const { prisma } = require("../config/database");

const getAllProducts = async (filters = {}) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy,
      page = 1,
      limit = 12,
    } = filters;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let where = {};
    if (search) {
      where.name = { contains: search };
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = {};
    if (sortBy === "price_asc") orderBy.price = "asc";
    else if (sortBy === "price_desc") orderBy.price = "desc";
    else orderBy.createdAt = "desc";

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getTopProducts = async () => {
  try {
    const [topSelling, topViewed] = await Promise.all([
      prisma.product.findMany({
        orderBy: { sold: "desc" },
        take: 10,
        include: { category: true },
      }),
      prisma.product.findMany({
        orderBy: { views: "desc" },
        take: 10,
        include: { category: true },
      }),
    ]);
    return { topSelling, topViewed };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getProductById = async (id) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { views: { increment: 1 } },
      include: { category: true },
    });
    return product;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const seedProductsService = async () => {
  try {
    const categories = [
      { name: "Keyboards" },
      { name: "Keycaps" },
      { name: "Switches" },
      { name: "Accessories" },
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
    }

    const cats = await prisma.category.findMany();
    const catMap = {};
    cats.forEach((c) => (catMap[c.name] = c.id));

    let products = [
      {
        name: "KeyCraft K65 Ultra",
        price: 249,
        isNew: true,
        description:
          "Bộ kit bàn phím cơ Gasket Mount cao cấp với vỏ nhôm CNC và tạ tùy chỉnh cân nặng.",
        categoryId: catMap["Keyboards"],
        stock: 15,
        sold: 50,
        views: 1200,
        images: [
          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800",
        ],
      },
      {
        name: "Obsidian Switches",
        price: 55,
        isNew: true,
        description:
          "Switch cơ học Linear được lube sẵn từ nhà máy, mang lại cảm giác gõ mượt mà và âm thanh trầm ấm.",
        categoryId: catMap["Switches"],
        stock: 100,
        sold: 145,
        views: 3500,
        images: [
          "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800",
        ],
      },
      {
        name: "Zenith Gasket Mount Kit",
        price: 320,
        isHot: true,
        description:
          "Trải nghiệm gõ phím đỉnh cao với cấu trúc Gasket Mount và kết nối 3 chế độ linh hoạt.",
        categoryId: catMap["Keyboards"],
        stock: 8,
        sold: 21,
        views: 890,
        images: [
          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800",
        ],
      },
    ];

    for (let i = 1; i <= 20; i++) {
      products.push({
        name: `Dummy Product ${i}`,
        price: 50 + i * 5,
        isNew: i % 3 === 0,
        isHot: i % 4 === 0,
        description: `Mô tả cho sản phẩm dummy thứ ${i}. Rất tuyệt vời.`,
        categoryId: i % 2 === 0 ? catMap["Keyboards"] : catMap["Keycaps"],
        stock: 20 + i,
        sold: i * 2,
        views: i * 15,
        images: [
          i % 2 === 0
            ? "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800"
            : "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800",
        ],
      });
    }

    for (const p of products) {
      await prisma.product.upsert({
        where: { id: products.indexOf(p) + 1 },
        update: p,
        create: p,
      });
    }

    return { EC: 0, EM: "Seed dữ liệu thành công!" };
  } catch (error) {
    console.log(error);
    return { EC: -1, EM: "Lỗi server khi seed dữ liệu" };
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getTopProducts,
  seedProductsService,
};
