# Codebase Summary

Cấu trúc toàn diện của dự án RoyalAuction:

```
c:\Users\TSC\Desktop\Auction
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Mô hình dữ liệu Prisma (PostgreSQL / SQLite)
│   │   └── seed.js                  # Dữ liệu khởi tạo (Admin, Members, Phòng, Vật phẩm)
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js            # Khởi tạo kết nối Prisma Client
│   │   ├── controllers/
│   │   │   ├── authController.js    # Đăng ký, đăng nhập JWT
│   │   │   ├── roomController.js    # Tạo phòng, duyệt phòng
│   │   │   ├── itemController.js    # Đăng bán vật phẩm, lấy danh sách lô
│   │   │   └── adminController.js   # Quản trị viên, cấu hình hệ thống
│   │   ├── middlewares/
│   │   │   └── auth.js              # Xác thực JWT & phân quyền Admin/Member
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── rooms.js
│   │   │   ├── items.js
│   │   │   └── admin.js
│   │   ├── services/
│   │   │   ├── auctionEngine.js     # Bộ xử lý đấu giá realtime, FIFO, 3-call timers
│   │   │   └── presenceService.js   # Kiểm soát ràng buộc 1 người / 1 phòng
│   │   └── server.js                # Khởi động HTTP & WebSocket Server
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Header điều hướng chuẩn dark luxury
│   │   │   ├── AuctionConsole.jsx   # Bàn đấu giá trực tiếp trung tâm
│   │   │   ├── CountdownBanner.jsx  # Banner thông báo lần 1, lần 2, lần 3
│   │   │   ├── ItemQueueDrawer.jsx  # Hàng đợi vật phẩm FIFO
│   │   │   ├── BidHistory.jsx       # Luồng đặt giá thời gian thực
│   │   │   ├── SellItemModal.jsx    # Modal đăng bán vật phẩm
│   │   │   ├── CreateRoomModal.jsx  # Modal tạo phòng đấu giá
│   │   │   └── admin/               # Các component trang quản trị
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Quản lý người dùng đăng nhập & phân quyền
│   │   │   └── SocketContext.jsx    # Kết nối Socket.IO thời gian thực
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Trang chủ & danh sách phòng
│   │   │   ├── RoomDetailPage.jsx   # Phòng đấu giá trực tiếp
│   │   │   ├── AdminDashboardPage.jsx # Trang quản trị Admin
│   │   │   └── TermsAndPoliciesPage.jsx # Quy chế hoạt động & Quyền nghĩa vụ
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # Tinh chỉnh theme màu WebSmith / Serko
│   ├── Dockerfile
│   └── package.json
│
├── docs/                            # Tài liệu chuẩn hóa dự án
├── plans/                           # Kế hoạch phát triển từng giai đoạn
├── scripts/                         # Script kiểm thử E2E tự động
└── docker-compose.yml               # Cấu hình khởi chạy toàn diện
```

