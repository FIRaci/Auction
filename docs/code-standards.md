# Code Standards & Engineering Guidelines

## 1. Nguyên tắc lập trình
- **Quy tắc 200 dòng code (Modularization)**: Nếu một file mã nguồn vượt quá 200 dòng, chủ động tách thành các module chuyên biệt, hook độc lập hoặc component nhỏ hơn.
- **Quy ước đặt tên**:
  - Tên file & thư mục: Sử dụng kebab-case hoặc camelCase theo chuẩn (`auction-engine.js`, `RoomDetailPage.jsx`).
  - Biến & Hàm: `camelCase` mang tính tự giải thích rõ ràng (`calculateNextBid`, `handleSingleRoomConstraint`).
  - Constants: `UPPER_SNAKE_CASE` (`MIN_BID_INCREMENT = 10000`).

## 2. Tiêu chuẩn Backend (Node.js & Express)
- Xử lý bất đồng bộ bằng `async/await` với bọc `try/catch` chuẩn hóa qua middleware tập trung.
- Kiểm tra tính hợp lệ của tham số đầu vào (input validation) trước khi thao tác với cơ sở dữ liệu.
- Socket.IO phân tách module rõ ràng: controller, engine, presence tracker.
- Không để lộ secret keys hoặc mật khẩu người dùng trong response (luôn exclude `passwordHash`).

## 3. Tiêu chuẩn Frontend (React & Tailwind CSS)
- Quản lý trạng thái bằng Context API và custom hooks (`useAuth`, `useAuctionSocket`).
- Component tách bạch giữa Container (logic & dữ liệu) và Presentational (hiển thị & giao diện).
- Tuân thủ khả năng tiếp cận (Accessibility - a11y): độ tương phản màu sắc cao, có aria-label cho các icon button.
- Format tiền tệ VNĐ rõ ràng bằng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.

