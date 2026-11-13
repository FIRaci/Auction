---
phase: 2
title: Backend & Realtime Auction Engine
status: completed
priority: P1
effort: 2h
dependencies:
  - phase-01-architecture-database
---

# Phase 2: Backend & Realtime Auction Engine

## Overview
Xây dựng REST API backend và Realtime Auction Engine sử dụng Socket.IO với đầy đủ các quy tắc nghiệp vụ đấu giá, xử lý hàng đợi FIFO, bộ đếm ngược 3 phút + 3 lần thông báo mỗi 30s, mua ngay và kiểm soát 1 người/1 phòng.

## Requirements
- Functional:
  - Auth APIs: Đăng ký, đăng nhập JWT, lấy thông tin user hiện tại (`/api/auth/me`).
  - Room APIs: Tạo phòng, danh sách phòng, chi tiết phòng kèm hàng đợi vật phẩm.
  - Item APIs: Đăng ký bán vật phẩm (tên, mô tả, ảnh, giá khởi điểm, giá mua ngay).
  - Socket.IO Realtime Engine:
    - Sự kiện `join_room`: Kiểm tra nếu user đang ở phòng khác -> tự động rời phòng cũ hoặc từ chối để đảm bảo nguyên tắc: *tại một thời điểm, mỗi người chỉ được tham gia vào 1 phòng*.
    - Sự kiện `place_bid`: Kiểm tra `bidAmount >= currentPrice + 10.000đ`.
      - Reset và kích hoạt bộ đếm thời gian: 3 phút không ai trả giá -> Server gửi thông báo Lần 1.
      - Sau 30s -> Thông báo Lần 2.
      - Sau 30s -> Thông báo Lần 3.
      - Sau Lần 3 -> Gõ búa (Hammer Down)! Chốt người mua, cập nhật trạng thái `SOLD`, chuyển sang vật phẩm tiếp theo trong hàng đợi FIFO.
    - Sự kiện `buy_now`: Người dùng nhấn mua với giá bán ngay -> chốt bán ngay lập tức không qua đấu giá, huỷ timer hiện tại, chuyển sang vật phẩm tiếp theo trong queue.
    - Quản lý hàng đợi (FIFO): Tự động giới thiệu vật phẩm theo `queueOrder`. Khi phòng bắt đầu hoặc vật phẩm trước kết thúc, vật phẩm kế tiếp tự động lên sàn (`BIDDING`).
- Non-functional:
  - Cơ chế timer hỗ trợ cả chế độ chuẩn (3 phút + 30s x 3) và chế độ Demo Fast-forward (ví dụ 10s + 5s x 3) có thể bật tắt/điều chỉnh bởi Admin để nghiệm thu trực tiếp tiện lợi.

## Related Code Files
- Create: `backend/src/server.js`
- Create: `backend/src/routes/auth.js`
- Create: `backend/src/routes/rooms.js`
- Create: `backend/src/routes/items.js`
- Create: `backend/src/routes/admin.js`
- Create: `backend/src/services/auctionEngine.js`
- Create: `backend/src/middlewares/auth.js`

## Implementation Steps
1. Xây dựng Express server kết hợp HTTP & Socket.IO server.
2. Viết auth controller & middleware xác thực JWT và kiểm tra quyền Admin/Member.
3. Viết CRUD cho Room và Item.
4. Xây dựng `AuctionEngine`:
   - Quản lý state theo từng phòng trong bộ nhớ + đồng bộ xuống Database.
   - Quản lý participant: map `userId -> currentRoomId` & `socketId`.
   - Quản lý hàng đợi FIFO của từng phòng.
   - Quản lý chu kỳ timer: `activeTimer`, `callCount` (1, 2, 3), `callTimers`.
   - Xử lý `place_bid` và `buy_now`.
5. Viết unit/integration test kịch bản đấu giá realtime.

## Success Criteria
- [ ] Ràng buộc 1 người chỉ tham gia 1 phòng hoạt động chính xác.
- [ ] Bắt buộc bước giá lớn hơn giá hiện tại ít nhất 10.000đ.
- [ ] Cơ chế 3 phút + 3 thông báo 30s + gõ búa hoạt động chuẩn xác.
- [ ] Mua ngay chốt giao dịch lập tức và xoay vòng vật phẩm tiếp theo trong hàng đợi.
