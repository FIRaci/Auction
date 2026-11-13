# Design Guidelines & UI/UX Standards (Inspired by Serko.ai)

Tài liệu này định hình phong cách thiết kế của RoyalAuction, học tập và tái hiện 100% ngôn ngữ thiết kế, tương tác và trải nghiệm người dùng từ **`https://www.serko.ai/`**:
- **Bầu không khí & Màu sắc**: Serko Signature Ambient Mesh Gradient với các lớp màu xanh băng mềm mại, chuyển tiếp tím nhạt và cam đào (`#001c38`, `#0078d4`, `#e5f2ff`, `#fcebff`, `#ffedea`).
- **Hình khối & Bo góc**: Bo tròn mềm mại đặc trưng Serko: Nút bấm hình viên thuốc (`rounded-full`), thẻ bề mặt siêu cong (`rounded-3xl` / `rounded-[2.5rem]`).
- **Trung tâm tương tác (Interactive Hero Showcase)**: Tái hiện card tương tác nổi tiếng của Serko.ai với các badge xác thực, nhãn kiểm định, live lot preview và thẻ đặt giá thời gian thực.
- **Biểu tượng**: Tuyệt đối **không dùng bất kỳ emoji icon nào**, 100% sử dụng bộ biểu tượng SVG cao cấp từ `lucide-react`.

---

## 1. Bảng màu chủ đạo (Serko Color Tokens)

| Mã Màu | Tên Token | Ứng Dụng |
| :--- | :--- | :--- |
| `#001c38` | `serko-navy` | Màu chữ chính, nút bấm primary, nền card điều hành cao cấp |
| `#0078d4` | `serko-blue` | Điểm nhấn thương hiệu, liên kết, badge active, hiệu ứng phát sáng |
| `#e5f2ff` | `serko-blue-soft` | Nền nhãn, badge trạng thái nhẹ, icon wrapper |
| `#f8fafc` | `serko-surface` | Bề mặt nền trang thanh khiết |
| `#5d6c7b` | `serko-slate` | Chữ phụ, mô tả, nhãn phụ đề |
| `#fcebff` | `serko-purple-soft` | Lớp phủ mesh gradient góc trên |
| `#ffedea` | `serko-peach-soft` | Lớp phủ ánh sáng hoàng hôn ấm áp |
| `#10b981` | `serko-emerald` | Trạng thái phòng LIVE và vật phẩm đang đấu |

---

## 2. Hệ thống kiểu chữ (Typography Hierarchy)

- **Font chữ chính**: `Plus Jakarta Sans` kết hợp `Inter` tạo cảm giác hiện đại, sắc sảo.
- **Font số học & tiền tệ**: `JetBrains Mono` cho bước giá, mã phòng và số tiền VNĐ.
- **Display Heading**: Kích thước lớn (`text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#001c38]`) với khoảng cách chữ chặt chẽ (`tracking-tight`) và các cụm từ nhấn nhá gradient (`text-transparent bg-clip-text bg-gradient-to-r from-serko-blue via-[#8e24aa] to-serko-peach`).
- **Eyebrow Tag**: Nhãn viên thuốc đặc trưng `serko-eyebrow` với chấm tròn pulse phát sáng.

---

## 3. Thành phần giao diện & Tương tác (Interactive Components)

### A. Navigation Bar
- Thanh điều hướng mờ kính nổi (`bg-white/80 backdrop-blur-xl border-b border-black/[0.06]`).
- Cụm điều hướng trung tâm dạng viên thuốc (`rounded-full bg-serko-gray`).
- Nút CTA đăng nhập dạng viên thuốc navy với mũi tên nghiêng trượt nhẹ khi hover.

### B. Live Marquee Ticker
- Dòng chữ chạy liên tục vô tận (Infinite Marquee) thông báo các diễn biến mới nhất của sàn đấu giá thời gian thực.

### C. Live Auction Console
- Bàn đấu giá chia 3 cột khoa học: Hàng đợi FIFO bên trái, Bàn đặt giá trực tiếp trung tâm, Nhật ký giao dịch dạng hội thoại bên phải.
- Banner cảnh báo đếm ngược 3 lần tích hợp đồng hồ đo tiến trình hình tròn (Circular SVG Progress Ring).
- Các nút đặt giá nhanh dạng viên thuốc bo tròn mềm mại (+10k, +50k, +100k, +500k).
- Nút **MUA NGAY (BUY NOW)** nổi bật với hiệu ứng chuyển màu uy lực.
