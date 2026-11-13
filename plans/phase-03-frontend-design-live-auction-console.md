---
phase: 3
title: Frontend Design & Live Auction Console
status: completed
priority: P1
effort: 2.5h
dependencies:
  - phase-02-backend-realtime-auction-engine
---

# Phase 3: Frontend Design & Live Auction Console

## Overview
Phát triển giao diện người dùng React cao cấp, áp dụng phong cách thiết kế từ `web-smith.de` (dark theme, gradient viền óng ánh, bóng đổ sang trọng), `serko.ai` (layout sắc sảo, micro-interactions, components tinh gọn), và `leauctions.vn` (Live Auction Console với búa gõ, hàng đợi lô đấu giá, lịch sử đặt giá thời gian thực). Nghiêm cấm emoji, chỉ dùng Lucide Icons.

## Requirements
- Visual & Theme:
  - Base colors: Dark obsidian `#090a0f`, deep slate `#11141e`, charcoal card `#181c28`.
  - Accent colors: Amber/Gold metallic `#f59e0b`, `#fbbf24`, `#d97706`, Emerald live badge `#10b981`.
  - Glassmorphism & Borders: `border-amber-500/20`, `backdrop-blur-xl`, hover glow effects.
  - Icons: Lucide React (Gavel, ShieldCheck, Clock, TrendingUp, Sparkles, Layers, Users, Zap, etc.).
- Pages & Components:
  - Header & Navigation: Brand Logo phong cách nhà đấu giá quý tộc, menu chính, trạng thái phòng hiện tại của user (với cảnh báo chỉ ở 1 phòng), số dư, thông tin đăng nhập.
  - Landing & Room Directory: Danh sách các phòng đấu giá Đang diễn ra (LIVE), Sắp mở (UPCOMING), Đã kết thúc (ENDED), nút Tham gia phòng.
  - Modal Đăng ký bán vật phẩm: Form đăng bán kèm thông tin, giá khởi điểm, giá mua ngay, ảnh, tự động thêm vào hàng đợi phòng.
  - Live Auction Console (Sàn đấu giá trực tiếp):
    - Khung vật phẩm trung tâm: Ảnh lớn, Tên vật phẩm, Thông tin mô tả, Giá khởi điểm, Giá mua ngay.
    - Bảng thông tin giá trực tiếp: Giá hiện tại (nhảy số realtime), Người dẫn đầu, Bước giá quy định tối thiểu (+10.000đ).
    - Cụm điều khiển đấu giá: Các nút bước giá nhanh (+10k, +50k, +100k, +500k, tùy chọn nhập số) và Nút "Mua Ngay" nổi bật.
    - Banner đếm ngược 3 lần thông báo: Trạng thái "Đếm lần 1", "Đếm lần 2", "Đếm lần 3" với hiệu ứng nhấp nháy màu hổ phách/vàng kim và biểu tượng búa gõ.
    - Hàng đợi vật phẩm (FIFO Queue Drawer): Danh sách các vật phẩm tiếp theo trong phòng, hiển thị số thứ tự lô.
    - Luồng lịch sử đặt giá (Bid Stream): Hiển thị từng lượt đặt giá thời gian thực kèm nhãn thời gian và danh tính người tham gia.

## Related Code Files
- Create: `frontend/package.json`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/context/AuthContext.jsx`
- Create: `frontend/src/context/SocketContext.jsx`
- Create: `frontend/src/components/Navbar.jsx`
- Create: `frontend/src/components/AuctionConsole.jsx`
- Create: `frontend/src/components/ItemQueueDrawer.jsx`
- Create: `frontend/src/components/BidHistory.jsx`
- Create: `frontend/src/components/CountdownBanner.jsx`
- Create: `frontend/src/components/SellItemModal.jsx`
- Create: `frontend/src/pages/HomePage.jsx`
- Create: `frontend/src/pages/RoomDetailPage.jsx`

## Implementation Steps
1. Khởi tạo dự án React với Vite và Tailwind CSS v3/v4.
2. Cấu hình bảng màu WebSmith / LeAuctions trong `tailwind.config.js`.
3. Tích hợp Lucide Icons và Socket.IO Client.
4. Xây dựng Auth & Socket Providers xử lý trạng thái kết nối và sự kiện phòng đấu giá.
5. Thiết kế Header, Hero, Rooms list, Modal tạo phòng & Modal bán vật phẩm.
6. Xây dựng Live Auction Console với trải nghiệm gõ búa, đếm 3 lần, đặt giá và mua ngay.

## Success Criteria
- [ ] Giao diện chuẩn dark theme cao cấp, đồng bộ, không dùng bất kỳ emoji nào.
- [ ] Socket.IO kết nối hai chiều mượt mà, phản hồi đặt giá và thông báo tức thì.
- [ ] Hiển thị trực quan hàng đợi FIFO và banner 3 lần thông báo.
