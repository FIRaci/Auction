# Deployment Guide & Environment Setup

## 1. Yêu cầu hệ thống
- Node.js >= 20 (hoặc Docker >= 20.10)
- npm >= 9
- SQLite (mặc định, sẵn sàng chạy ngay) hoặc PostgreSQL (khi nâng cấp lưu trữ bền vững).

---

## 2. Deploy lên Render bằng Blueprint (`render.yaml`) — Khuyên dùng

Project sử dụng mô hình **Unified Web Service** trên Render (`render.yaml` ở thư mục gốc):
- **Build Command**: `npm run render:build`
  1. Cài dependencies frontend (`--include=dev`) và build React SPA vào `frontend/dist`.
  2. Cài dependencies backend (`--include=dev`) và chạy `prisma generate`.
- **Start Command**: `npm run render:start` (`cd backend && npx prisma db push && node prisma/seed.js --if-empty && node src/server.js`)
  - Đồng bộ schema Prisma, tự động seed dữ liệu mẫu nếu database chưa có phòng nào (`--if-empty`), rồi khởi động Express + Socket.IO server phục vụ cả API (`/api/*`), WebSocket (`/socket.io/*`) và frontend SPA (`/`) trên cùng origin.
- **Health Check**: `/api/health`

### Các bước triển khai trên Render:
1. Mở [Render Dashboard](https://dashboard.render.com) → **New +** → **Blueprint** (hoặc dùng link `https://render.com/deploy?repo=https://github.com/FIRaci/Auction`).
2. Kết nối GitHub repo `FIRaci/Auction` (branch `main`).
3. Render tự động nhận diện `render.yaml` với các biến môi trường:
   - `NODE_ENV=production`
   - `DATABASE_URL=file:./dev.db`
   - `JWT_SECRET` (Render tự sinh giá trị bảo mật qua `generateValue: true`)
   - `DEMO_FAST_FORWARD=false` (đổi sang `"true"` trên dashboard nếu muốn chạy chu kỳ demo 10s / 5s)
4. Nhấn **Apply** để Render build và phát hành ứng dụng.

### Lưu ý về dữ liệu trên Render Free Plan:
- Gói Free không bao gồm Persistent Disk nên filesystem container sẽ reset khi redeploy hoặc sleep wake-up; cờ `--if-empty` đảm bảo hệ thống luôn có sẵn 3 phòng và 10 hiện vật mẫu ngay sau khi khởi động.
- Khi nâng cấp lên gói trả phí cần lưu dữ liệu bền vững: thêm Render Disk gắn vào `/opt/render/project/src/backend/prisma` hoặc chuyển sang Render Managed PostgreSQL (`provider = "postgresql"` trong `backend/prisma/schema.prisma`).

---

## 3. Khởi chạy bằng Docker Compose
```bash
# Khởi động Backend và Frontend
docker-compose up --build -d

# Xem log các container
docker-compose logs -f

# Dừng hệ thống
docker-compose down
```

---

## 4. Khởi chạy trực tiếp (Local Development)

### Bước 1: Cấu hình và chạy Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

### Bước 2: Cấu hình và chạy Frontend
```bash
cd frontend
npm install
npm run dev
```
Truy cập ứng dụng tại `http://localhost:5173`.
