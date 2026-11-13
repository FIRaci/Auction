---
phase: 1
title: Architecture & Database
status: completed
priority: P1
effort: 1h
dependencies: []
---

# Phase 1: Architecture & Database

## Overview
Thiết kế kiến trúc tổng thể, mô hình thực thể dữ liệu (Prisma Schema), cơ chế định danh & phân quyền (RBAC), và cấu trúc thư mục chuẩn monorepo (`backend` và `frontend`).

## Requirements
- Functional:
  - Bảng User: Lưu email, passwordHash, fullName, phone, role (ADMIN, MEMBER), balance, currentRoomId.
  - Bảng Room: id, name, description, code, status (UPCOMING, LIVE, ENDED), createdById, currentItemId, createdAt.
  - Bảng Item: id, roomId, title, description, imageUrl, startingPrice, buyNowPrice, currentPrice, minIncrement (10.000đ), status (WAITING, BIDDING, SOLD, UNSOLD), queueOrder, sellerId, winnerId, soldAt.
  - Bảng Bid: id, itemId, bidderId, amount, createdAt.
  - Bảng RoomParticipant: userId, roomId, socketId, joinedAt (ràng buộc 1 người chỉ ở 1 phòng).
  - Bảng AuctionEventLog: roomId, itemId, eventType, message, createdAt.
- Non-functional:
  - Database schema hỗ trợ PostgreSQL và SQLite (để dev/test nội bộ cực nhanh và chạy Docker mượt mà).
  - Prisma Client type-safety cho toàn bộ backend logic.

## Architecture
- Client-Server Architecture:
  - `frontend/`: React 19 / Vite + Tailwind CSS + Lucide Icons + Socket.io-client.
  - `backend/`: Node.js Express + Socket.IO server + Prisma ORM.

## Related Code Files
- Create: `backend/prisma/schema.prisma`
- Create: `backend/package.json`
- Create: `backend/src/config/prisma.js`
- Create: `README.md`
- Create: `docs/*`

## Implementation Steps
1. Khởi tạo `README.md` và tài liệu chuẩn trong `docs/`.
2. Tạo thư mục `backend/` và cấu hình `package.json`, Prisma, dependencies.
3. Viết `schema.prisma` đầy đủ các Model và Enums.
4. Chạy `prisma generate` và `prisma db push` (hoặc migrate).
5. Viết seed script tạo sẵn tài khoản Admin, Member mẫu, và phòng đấu giá demo với hàng đợi các lô vật phẩm.

## Success Criteria
- [ ] Database schema hoàn chỉnh các quan hệ User, Room, Item, Bid, RoomParticipant.
- [ ] Seed script chạy thành công tạo tài khoản admin/user và phòng đấu giá mẫu.
