# Project Overview & Product Development Requirements (PDR)

## 1. Giới thiệu dự án
RoyalAuction là nền tảng sàn đấu giá trực tuyến thời gian thực (Real-time Online Auction Platform), được thiết kế theo các tiêu chuẩn vận hành khắt khe của các nhà đấu giá chuyên nghiệp (như Le Auction House) kết hợp ngôn ngữ thiết kế tinh tế từ các agency công nghệ hàng đầu (`web-smith.de` và `serko.ai`).

## 2. Đối tượng người dùng & Phân quyền
- **Khách vãng lai (Guest)**: Xem danh mục phòng, tra cứu vật phẩm, đọc quy chế & điều khoản quyền nghĩa vụ.
- **Thành viên tham gia (Member)**:
  - Tạo phòng đấu giá mới.
  - Tham gia phòng đấu giá (Tại một thời điểm chỉ được hiện diện trong 1 phòng duy nhất).
  - Đăng bán vật phẩm (kèm thông tin, giá khởi điểm, giá mua ngay).
  - Đặt giá đấu giá (bước giá hợp lệ: `amount >= currentPrice + 10.000đ`).
  - Mua ngay vật phẩm với giá niêm yết mà không cần qua đấu giá.
- **Quản trị viên (Admin)**:
  - Xem dashboard thống kê GMV, số phòng, số người online.
  - Quản lý và duyệt phòng, sắp xếp lại hàng đợi FIFO các vật phẩm.
  - Bàn điều khiển đấu giá viên (Auctioneer Console): can thiệp gõ búa, hủy lô, kích hoạt chế độ Demo Fast-forward.
  - Quản trị tài khoản thành viên.

## 3. Quy tắc cốt lõi & Tiêu chuẩn chấp nhận (Acceptance Criteria)
1. **Quy tắc phòng đơn (Single Room Constraint)**: Mỗi tài khoản chỉ có thể tham gia 1 phòng đấu giá tại 1 thời điểm. Nếu người dùng chuyển sang phòng mới, hệ thống tự động ngắt kết nối khỏi phòng cũ.
2. **Quy tắc đặt giá (Bid Validation)**: Giá đặt mới phải cao hơn giá hiện tại ít nhất 10.000 VNĐ. Nếu không đáp ứng, server trả về lỗi `Lệnh đặt giá không hợp lệ`.
3. **Quy tắc đếm ngược 3 lần (3-Minute Idle & 3-Call Countdown)**:
   - Sau mỗi lệnh đặt giá hợp lệ, bắt đầu bộ đếm 3 phút (180 giây).
   - Nếu trong 3 phút không có người trả giá cao hơn: Server phát thông báo "Đếm lần thứ nhất".
   - Sau 30 giây tiếp theo nếu vẫn không có ai trả giá: Server phát thông báo "Đếm lần thứ hai".
   - Sau 30 giây tiếp theo nếu vẫn không có ai trả giá: Server phát thông báo "Đếm lần thứ ba".
   - Sau thông báo lần thứ ba: Gõ búa (Hammer Down)! Chốt người thắng đấu giá, cập nhật trạng thái `SOLD`.
4. **Quy tắc Mua ngay (Buy Now)**:
   - Bất kỳ thành viên nào trong phòng có thể chọn mua ngay với giá `buyNowPrice`.
   - Giao dịch được xác nhận ngay lập tức, vật phẩm được bán không qua đấu giá, timer đang chạy bị hủy.
5. **Quy tắc hàng đợi (FIFO Queue Transition)**:
   - Khi một vật phẩm kết thúc (bằng gõ búa hoặc mua ngay), server tự động giới thiệu vật phẩm tiếp theo trong hàng đợi của phòng lên sàn (`BIDDING`).

