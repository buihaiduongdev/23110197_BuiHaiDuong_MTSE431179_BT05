require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connection } = require("./config/database");
const configViewEngine = require("./config/viewEngine");
const apiRoutes = require("./routes/api");
const { getHomepage } = require("./controllers/homeController");
const { seedProductsService } = require("./services/productServices");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

// config route cho view ejs
const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use("/", webAPI);

// config route cho API
app.use("/v1/api/", apiRoutes);

(async () => {
  try {
    await connection();

    console.log(">>> Đang tự động seed dữ liệu sản phẩm...");
    const seedRes = await seedProductsService();
    console.log(`>>> Kết quả seed: ${seedRes.EM}`);

    app.listen(port, () => {
      console.log(`Backend API đang chạy ở port ${port}`);
    });
  } catch (error) {
    console.log(">>> Error connect to DB: ", error);
  }
})();
