# System Architecture & Technical Blueprint

## 1. Kiến trúc tổng thể (Architecture Overview)

```
[ Client: React + Tailwind + Lucide ]
             │
             ├──────────── HTTPS / REST API ───────────┐
             │                                         ▼
             │                              [ Express.js API Server ]
             │                                         │
             ├────────── WSS / Socket.IO ──────────────┤
             │                                         ▼
             │                           [ Realtime Auction Engine ]
             │                             - FIFO Queue Manager
             │                             - Presence & Room Constraint
             │                             - 3-Call Countdown Timer
             │                                         │
             ▼                                         ▼
[ Docker Environment ] <────────────────────── [ Prisma ORM ]
                                                       │
                                                       ▼
                                            [ PostgreSQL Database ]
```

## 2. Mô hình dữ liệu Prisma (Entity Relationship)

- **User**: Định danh tài khoản, mật khẩu băm bcrypt, vai trò `ADMIN` hoặc `MEMBER`, số dư tài khoản.
- **Room**: Phòng đấu giá với mã phòng, tiêu đề, trạng thái (`UPCOMING`, `LIVE`, `ENDED`), ID người tạo, ID vật phẩm đang đấu (`currentItemId`).
- **Item**: Lô vật phẩm thuộc phòng, thông tin mô tả, ảnh, `startingPrice`, `buyNowPrice`, `currentPrice`, `minIncrement` (10.000đ), trạng thái (`WAITING`, `BIDDING`, `SOLD`, `UNSOLD`), thứ tự hàng đợi `queueOrder`, ID người bán, ID người thắng.
- **Bid**: Lịch sử đặt giá gồm `amount`, `itemId`, `bidderId`, thời điểm đặt giá.
- **RoomParticipant**: Trạng thái tham gia phòng của người dùng, liên kết `userId` với `roomId` và `socketId` để cưỡng chế nguyên tắc 1 phòng tại 1 thời điểm.
- **AuctionEventLog**: Ghi vết các sự kiện đấu giá: đặt giá mới, phát thông báo lần 1/2/3, gõ búa chốt giá, mua ngay.

## 3. Realtime Auction Engine Workflow
```mermaid
stateDiagram-v2
    [*] --> WAITING: Vật phẩm trong hàng đợi FIFO
    WAITING --> BIDDING: Vật phẩm lên sàn (Live)
    BIDDING --> BIDDING: Đặt giá hợp lệ (+ >= 10.000đ) / Reset Timer 3 phút
    BIDDING --> CALL_1: Hết 3 phút không có giá mới
    CALL_1 --> CALL_2: Sau 30s không có giá mới
    CALL_2 --> CALL_3: Sau 30s không có giá mới
    CALL_3 --> SOLD_HAMMER: Sau 30s không có giá mới (Gõ búa!)
    CALL_1 --> BIDDING: Có người trả giá cao hơn (+10.000đ)
    CALL_2 --> BIDDING: Có người trả giá cao hơn (+10.000đ)
    CALL_3 --> BIDDING: Có người trả giá cao hơn (+10.000đ)
    BIDDING --> SOLD_BUYNOW: Khách bấm Mua Ngay
    SOLD_HAMMER --> NEXT_ITEM: Tự động kích hoạt lô tiếp theo
    SOLD_BUYNOW --> NEXT_ITEM: Tự động kích hoạt lô tiếp theo
    NEXT_ITEM --> BIDDING: Có lô tiếp theo
    NEXT_ITEM --> [*]: Hết lô trong phòng (Phòng ENDED)
```

