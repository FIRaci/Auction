---
title: Online Auction System
description: >-
  Hệ thống sàn đấu giá trực tuyến thời gian thực với phân quyền Admin/Member,
  hàng đợi FIFO, cơ chế đấu giá 3 phút + 3 lần gọi 30s, mua ngay, và giao diện
  chuẩn web-smith.de / serko.ai / leauctions.vn
status: completed
priority: P1
branch: main
tags:
  - auction
  - nodejs
  - react
  - socketio
  - prisma
  - docker
  - realtime
blockedBy: []
blocks: []
created: '2026-11-11T05:42:11.025Z'
createdBy: 'ck:plan'
source: skill
---

# Online Auction System - Master Plan

## Overview
Hệ thống sàn đấu giá trực tuyến thời gian thực chuẩn mực, phong cách thiết kế cao cấp lấy cảm hứng từ `web-smith.de` (dark theme, ánh kim sang trọng, viền phát sáng, không dùng emoji), `serko.ai` (cấu trúc SaaS hiện đại, micro-interactions tinh tế), và `leauctions.vn` (quy chế đấu giá chuyên nghiệp, console gõ búa trực tiếp, bảng quyền và nghĩa vụ chi tiết).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Architecture & Database](./phase-01-architecture-database.md) | Completed |
| 2 | [Backend & Realtime Auction Engine](./phase-02-backend-realtime-auction-engine.md) | Completed |
| 3 | [Frontend Design & Live Auction Console](./phase-03-frontend-design-live-auction-console.md) | Completed |
| 4 | [Admin Control Center](./phase-04-admin-control-center.md) | Completed |
| 5 | [Terms Rights & Obligations](./phase-05-terms-rights-obligations.md) | Completed |
| 6 | [Docker & End-to-End Validation](./phase-06-docker-end-to-end-validation.md) | Completed |

## Core Business Requirements Check
- [x] Mỗi người tạo phòng đấu giá
- [x] Mỗi người tham gia phòng đấu giá (Tại 1 thời điểm chỉ vào đúng 1 phòng)
- [x] Đăng bán vật phẩm (thông tin vật phẩm, giá khởi điểm, giá bán ngay)
- [x] Đấu giá vật phẩm (bước giá tối thiểu 10.000 VNĐ)
- [x] Mua ngay không qua đấu giá
- [x] Quản lý vật phẩm trong phòng theo hàng đợi FIFO (lần lượt lên sàn)
- [x] Cơ chế đếm giá: Sau mỗi lần đặt giá 3 phút không có ai trả cao hơn -> gửi thông báo 3 lần, mỗi lần cách nhau 30 giây -> sau 3 lần thông báo chốt người mua cao nhất
- [x] Phân quyền Admin & Thành viên, Admin có UI quản lý, kiểm soát, điều hành
- [x] Tài liệu Quyền và Nghĩa vụ chi tiết đầy đủ (học từ Le Auctions)
- [x] Docker hóa toàn diện
