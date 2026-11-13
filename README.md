# RoyalAuction (Sàn Đấu Giá Trực Tuyến Thời Gian Thực)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/FIRaci/Auction)

Hệ thống sàn đấu giá trực tuyến thời gian thực cao cấp, kiến trúc trải nghiệm ánh sáng tương tác lấy cảm hứng từ **serko.ai**, chuyển động tinh xảo từ **prompt-motion.com** / **itshover.com** / **ui.live**, và quy chế đấu giá trực tiếp chuyên nghiệp theo **Luật Đấu giá tài sản 01/2016/QH14**.

---

## Tính năng cốt lõi (Core Capabilities)

### 1. Dành cho người tham gia đấu giá (Member)
- **Tạo phòng đấu giá**: Khởi tạo phòng đấu giá mới với quy chế và thời gian cụ thể.
- **Tham gia phòng đấu giá**: Tại một thời điểm, mỗi người chỉ được tham gia vào **1 phòng đấu giá duy nhất** (ràng buộc nghiêm ngặt ở cả backend realtime và frontend).
- **Đăng bán vật phẩm**: Đăng thông tin vật phẩm, giá khởi điểm, giá bán ngay (Buy Now). Vật phẩm tự động xếp vào hàng đợi FIFO của phòng đấu giá.
- **Đấu giá trực tiếp (Live Bidding)**:
  - Đặt giá theo thời gian thực (bước giá tối thiểu **10.000 VNĐ** so với giá hiện tại).
  - Nhận phản hồi giá mới nhất tức thì qua WebSocket (Socket.IO).
- **Mua ngay (Buy Now)**: Mua vật phẩm ngay lập tức theo giá niêm yết mà không cần qua đấu giá.
- **Tra cứu Quy chế & Quyền nghĩa vụ**: Bảng quy định pháp lý minh bạch theo Luật Thương mại và Luật Đấu giá tài sản.

### 2. Dành cho máy chủ (Auction Server Engine)
- **Quản lý hàng đợi vật phẩm (FIFO Queue)**: Các vật phẩm đăng bán lần lượt được xếp hàng và tự động giới thiệu theo thứ tự trong phiên bán.
- **Tổ chức đấu giá & Đếm bước giá chuẩn xác**:
  - Nhận lệnh đặt giá và kiểm tra tính hợp lệ (`Giá đặt >= Giá hiện tại + 10.000 VNĐ`).
  - Sau mỗi lần đặt giá **3 phút**, nếu không có ai trả giá cao hơn, Server gửi **thông báo 3 lần, mỗi lần cách nhau 30 giây** ("Lần thứ nhất", "Lần thứ hai", "Lần thứ ba").
  - Sau 3 lần thông báo không có ai trả giá cao hơn, người đặt giá cao nhất là người trúng đấu giá (**Gõ búa - Hammer Down**).
  - Tự động kích hoạt vật phẩm tiếp theo trong hàng đợi FIFO.
- **Xử lý Mua ngay**: Khi có người chọn Mua ngay, vật phẩm lập tức chuyển trạng thái `SOLD` cho người mua đó, huỷ bộ đếm đấu giá và chuyển sang vật phẩm tiếp theo trong queue.

### 3. Dành cho Quản trị viên (Admin Portal)
- Giao diện quản lý, kiểm soát, giám sát phiên đấu giá thời gian thực.
- Can thiệp phiên: Gõ búa cưỡng bức, bỏ qua lô không người mua, điều phối hàng đợi FIFO.
- Chế độ **Demo Fast-Forward** (cho phép chuyển đổi chu kỳ 3 phút / 30s sang chế độ rút gọn 10s / 5s để nghiệm thu và kiểm thử nhanh).
- Quản lý người dùng và phân quyền (Admin / Member).

---

## Phong cách thiết kế (Design Identity)
- **Giao diện & Typography**: Nền sáng thanh lịch kết hợp dải horizon gradient (`#f2f8ff` → `#e8f1ff`), điểm nhấn coral-violet-azure, font tiếng Việt `Be Vietnam Pro` + `JetBrains Mono` tối ưu hiển thị dấu thanh và số liệu giá.
- **Biểu tượng**: **Không sử dụng emoji**, 100% SVG tùy chỉnh (`RoyalBrandMark`, `itshover` animated icons) và `lucide-react`.
- **Trải nghiệm**: Live Auction Console hai chiều với đồng hồ vòng tròn 3 lần thông báo, WebSocket sync tức thì và hiệu ứng motion mượt mà.

---

## Công nghệ sử dụng (Tech Stack)
- **Frontend**: React 19, Vite, Tailwind CSS, Motion (`motion/react`), Lucide React, Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, Prisma ORM, JWT, Bcrypt.
- **Database**: SQLite / PostgreSQL (qua Prisma ORM).
- **Deployment**: Render Blueprint (`render.yaml`), Docker & Docker Compose.

---

## Deploy lên Render bằng Blueprint (1-Click)

Repository đã bao gồm đầy đủ file [`render.yaml`](./render.yaml) theo kiến trúc unified full-stack (Backend Express + Socket.IO đồng thời phục vụ React build tĩnh trên cùng một origin, tự động `prisma db push` + seed dữ liệu mẫu khi database trống):

1. Nhấn nút **Deploy to Render** ở trên (hoặc vào Render Dashboard → **New +** → **Blueprint**).
2. Chọn repository `FIRaci/Auction`, nhánh `main`.
3. Render tự động đọc `render.yaml`, tạo Web Service `royal-auction` (`plan: free`), sinh `JWT_SECRET` ngẫu nhiên, chạy `npm run render:build` và `npm run render:start`.
4. Kiểm tra health endpoint tại `/api/health`.

> **Lưu ý trên Render Free plan:** SQLite ephemeral sẽ được tự động khởi tạo và seed 3 phòng + 10 hiện vật mẫu qua `node prisma/seed.js --if-empty` mỗi khi instance khởi động lại với database trống. Nếu cần lưu trữ bền vững lâu dài, gắn Render Persistent Disk tại `/app/backend/prisma` hoặc chuyển `provider` trong `schema.prisma` sang `postgresql`.

---

## Khởi chạy Local & Docker

### 1. Chạy bằng Docker Compose
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### 2. Chạy trực tiếp (Local Development)
1. **Backend**:
```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev
```
2. **Frontend**:
```bash
cd frontend
npm install
npm run dev
```
Truy cập ứng dụng tại `http://localhost:5173`.

---

## Tài khoản mặc định (Default Accounts)
- **Admin**: `admin@royalauction.vn` / `Admin@123456`
- **Member 1**: `bidder1@royalauction.vn` / `Member@123456`
- **Member 2**: `bidder2@royalauction.vn` / `Member@123456`
