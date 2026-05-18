# 23110197_BuiHaiDuong_MTSE431179_BT05

**Bài Tập Fullstack: ExpressJS - ReactJS - MySQL**

**Database name:** `fullstack02`

---

## 1. Chạy Backend (ExpressJS)

Mở terminal tại thư mục `FullStackNodeJS01/ExpressJS01`:

```bash
# 1. Cài đặt thư viện
npm install

# 2. Setup file .env
# PORT=8080
# DATABASE_URL="mysql://root:1122cauvanG%21@localhost:3306/fullstack02"
# JWT_SECRET=sercretkey_cua_duong
# JWT_EXPIRE=1h

# 3. Khởi tạo Prisma & đồng bộ Database
npx prisma generate
npx prisma db push

# 4. Khởi động Server
npm start
```

> **API Server chạy tại:** `http://localhost:8080`

---

## 2. Chạy Frontend (ReactJS)

Mở một terminal mới tại thư mục `FullStackNodeJS01/ReactJS01`:

```bash
# 1. Cài đặt thư viện
npm install

# 2. Khởi động Frontend
npm run dev
```

> **Website chạy tại:** `http://localhost:5173`

---
