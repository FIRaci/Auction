---
phase: 4
title: Admin Control Center
status: completed
priority: P1
effort: 1.5h
dependencies:
  - phase-03-frontend-design-live-auction-console
---

# Phase 4: Admin Control Center

## Overview
Xây dựng trang Dashboard quản trị (Admin Portal) cho phép người điều hành kiểm soát toàn bộ phòng đấu giá, quản lý các lô vật phẩm, điều chỉnh hàng đợi, can thiệp phiên (gõ búa sớm, tua nhanh demo), và quản lý thành viên.

## Requirements
- Functional:
  - Bảng điều khiển tổng quan (Metrics): Số phòng hoạt động, tổng số vật phẩm, tổng thành viên online, tổng doanh thu đấu giá (GMV).
  - Quản lý phòng (Room Manager): Tạo phòng mới, chỉnh sửa thông tin phòng, kích hoạt phòng (`UPCOMING` -> `LIVE` -> `ENDED`), xem danh sách thành viên đang có mặt.
  - Quản lý hàng đợi vật phẩm (Queue Manager): Xem thứ tự các lô trong phòng, kéo thả/đổi thứ tự hàng đợi, duyệt/hủy vật phẩm đăng bán của thành viên.
  - Bàn điều khiển đấu giá viên (Auctioneer Live Override):
    - Quyền gõ búa chốt lô ngay lập tức.
    - Quyền bỏ qua lô không có người trả giá (Chuyển sang `UNSOLD`).
    - Nút chuyển đổi thời gian: Chế độ chuẩn (3 phút + 30s x 3) hoặc Chế độ Demo (10s + 5s x 3) để test & nghiệm thu ngay trên sân khấu demo.
  - Quản lý người dùng: Xem danh sách thành viên, cấp/thu hồi quyền Admin, xem lịch sử tham gia phòng và đấu giá.

## Related Code Files
- Create: `frontend/src/pages/AdminDashboardPage.jsx`
- Create: `frontend/src/components/admin/AdminRoomManager.jsx`
- Create: `frontend/src/components/admin/AdminItemQueueManager.jsx`
- Create: `frontend/src/components/admin/AdminAuctioneerConsole.jsx`
- Create: `frontend/src/components/admin/AdminUserManager.jsx`

## Implementation Steps
1. Xây dựng Route bảo vệ `/admin` chỉ dành cho người dùng có role `ADMIN`.
2. Thiết kế layout quản trị đồng bộ phong cách dark theme chuyên nghiệp.
3. Tạo các tab: Tổng quan, Quản lý phòng & Hàng đợi, Bàn điều hành đấu giá, Thành viên.
4. Tích hợp các thao tác CRUD và nút can thiệp trực tiếp với Socket.IO.

## Success Criteria
- [ ] Chỉ Admin mới truy cập được trang quản trị.
- [ ] Admin có thể tạo phòng, sửa đổi hàng đợi vật phẩm, và điều khiển phiên đấu giá.
- [ ] Nút Demo Fast-Forward hỗ trợ kiểm tra luồng 3 lần thông báo nhanh chóng.
