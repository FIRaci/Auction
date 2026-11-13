---
phase: 6
title: Docker & End-to-End Validation
status: completed
priority: P1
effort: 1.5h
dependencies:
  - phase-02-backend-realtime-auction-engine
  - phase-03-frontend-design-live-auction-console
  - phase-04-admin-control-center
  - phase-05-terms-rights-obligations
---

# Phase 6: Docker & End-to-End Validation

## Overview
Đóng gói toàn bộ ứng dụng bằng Docker & Docker Compose (Frontend, Backend, PostgreSQL), đồng thời viết bộ kịch bản kiểm thử tự động (E2E Test Script) để xác minh 100% các tiêu chí yêu cầu của đề bài.

## Requirements
- Docker Architecture:
  - `backend/Dockerfile`: Multi-stage build Node.js runtime, Prisma generation, healthcheck.
  - `frontend/Dockerfile`: Multi-stage Vite build + Nginx alpine / lightweight Node web server.
  - `docker-compose.yml`: Kết nối service `db` (PostgreSQL), `backend`, và `frontend`, cấu hình volume dữ liệu bền vững, biến môi trường `.env`.
- End-to-End Test Suite:
  - Kiểm thử 1: Tạo tài khoản, đăng nhập, phân quyền Admin và Member.
  - Kiểm thử 2: Tạo phòng đấu giá.
  - Kiểm thử 3: Ràng buộc 1 người chỉ tham gia 1 phòng cùng lúc.
  - Kiểm thử 4: Đăng bán vật phẩm (thông tin, giá khởi điểm, giá mua ngay).
  - Kiểm thử 5: Cơ chế hàng đợi FIFO đưa vật phẩm lần lượt lên sàn.
  - Kiểm thử 6: Đặt giá đấu giá hợp lệ (kiểm tra từ chối nếu < giá hiện tại + 10.000đ; chấp nhận nếu hợp lệ).
  - Kiểm thử 7: Cơ chế đếm 3 lần sau 3 phút (hoặc chế độ test) -> Gõ búa chốt người mua.
  - Kiểm thử 8: Mua ngay không qua đấu giá -> chốt lập tức và chuyển sang lô tiếp theo.

## Related Code Files
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `scripts/test-e2e.js`

## Implementation Steps
1. Viết Dockerfile cho Backend và Frontend.
2. Viết `docker-compose.yml` với networks và healthchecks.
3. Viết script `test-e2e.js` mô phỏng 2 bidders và 1 admin tương tác thời gian thực qua WebSockets.
4. Chạy kiểm thử tự động xác nhận toàn bộ luồng hoạt động hoàn hảo.
5. Soạn thảo hướng dẫn khởi chạy trong `README.md` và `docs/deployment-guide.md`.

## Success Criteria
- [ ] Docker compose build & up thành công không có lỗi.
- [ ] Test E2E xác minh đầy đủ 8/8 nghiệp vụ yêu cầu của đề bài.
