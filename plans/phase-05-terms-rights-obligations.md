---
phase: 5
title: Terms Rights & Obligations
status: completed
priority: P1
effort: 1h
dependencies:
  - phase-01-architecture-database
---

# Phase 5: Terms Rights & Obligations (Quy chế & Quyền Nghĩa Vụ)

## Overview
Xây dựng văn bản pháp lý và trang giao diện hiển thị quy chế hoạt động, quyền và nghĩa vụ của các bên tham gia sàn đấu giá trực tuyến theo chuẩn mực nhà đấu giá chuyên nghiệp (như Le Auction House) và quy định pháp luật Việt Nam (Luật Thương mại số 36/2005/QH11, Luật Đấu giá tài sản số 01/2016/QH14).

## Requirements
- Nội dung văn bản chi tiết, chia chương mục rõ ràng:
  1. **Chương I: Quy định chung & Giải thích từ ngữ**: Định nghĩa về Sàn, Người bán, Người tham gia đấu giá, Đấu giá viên, Phòng đấu giá, Lô vật phẩm, Giá khởi điểm, Bước giá (tối thiểu 10.000 VNĐ), Giá mua ngay, Gõ búa (Hammer).
  2. **Chương II: Nguyên tắc & Quy chế vận hành phiên đấu giá trực tuyến**:
     - Quy tắc tham gia: *Tại một thời điểm, mỗi người chỉ được tham gia vào 1 phòng đấu giá duy nhất*.
     - Quy tắc hàng đợi FIFO: Vật phẩm đăng bán được xếp hàng và lần lượt lên sàn.
     - Quy tắc đặt giá: Lệnh đặt giá phải lớn hơn giá hiện tại ít nhất 10.000 VNĐ.
     - Quy tắc chốt giá 3 lần: Sau 3 phút không ai trả giá cao hơn, hệ thống thông báo 3 lần, mỗi lần cách nhau 30 giây ("Lần 1", "Lần 2", "Lần 3"). Sau 3 lần thông báo không có lệnh đặt mới, người trả giá cao nhất được xác định là người trúng đấu giá.
     - Quy tắc Mua ngay (Buy Now): Khách hàng có quyền mua ngay với mức giá niêm yết, chốt giao dịch không qua đấu giá và hệ thống tự động chuyển sang lô tiếp theo.
  3. **Chương III: Quyền và Nghĩa vụ của Người tham gia đấu giá (Người mua)**:
     - Quyền xem xét thông tin, kiểm tra tình trạng vật phẩm, đặt giá hợp lệ, khiếu nại.
     - Nghĩa vụ tuân thủ quy tắc 1 phòng tại 1 thời điểm, nghĩa vụ thanh toán trong thời hạn 7 ngày làm việc, chịu trách nhiệm pháp lý với lệnh đặt giá của mình.
  4. **Chương IV: Quyền và Nghĩa vụ của Người bán (Chủ sở hữu vật phẩm)**:
     - Quyền định giá khởi điểm và giá mua ngay, nhận tiền bán sau khi khấu trừ phí sàn.
     - Nghĩa vụ cung cấp thông tin trung thực, cam kết quyền sở hữu hợp pháp đối với vật phẩm, bàn giao vật phẩm đúng hiện trạng.
  5. **Chương V: Quyền và Trách nhiệm của Đơn vị vận hành Sàn (Platform / Ban Quản Trị)**:
     - Điều phối phiên đấu giá, bảo đảm hệ thống máy chủ hoạt động ổn định, ghi nhận dữ liệu giao dịch minh bạch, tạm dừng hoặc hủy lệnh gian lận.
  6. **Chương VI: Thanh toán, Đặt cọc, Giao nhận và Chế tài vi phạm**:
     - Quy định phạt bỏ cọc, chế tài đối với hành vi phá vỡ phiên đấu giá hoặc không thanh toán.
  7. **Chương VII: Giải quyết tranh chấp, khiếu nại và Điều khoản thi hành**.

## Related Code Files
- Create: `frontend/src/pages/TermsAndPoliciesPage.jsx`
- Create: `docs/auction-regulations-terms-rights-obligations.md`

## Implementation Steps
1. Soạn thảo tài liệu chuẩn markdown trong `docs/auction-regulations-terms-rights-obligations.md`.
2. Tạo trang `/quy-che-quyen-nghia-vu` trên Frontend với thanh điều hướng mục lục (TOC), hiệu ứng cuộn mượt, tìm kiếm điều khoản, và giao diện đọc cao cấp.
3. Liên kết trang quy chế vào Footer, Modal đặt giá, và Modal tạo phòng/bán vật phẩm (checkbox xác nhận đã đọc và đồng ý).

## Success Criteria
- [ ] Văn bản đầy đủ, chuyên nghiệp, phản ánh chuẩn xác các quy tắc vận hành của hệ thống.
- [ ] Giao diện trang hiển thị đẹp mắt, trực quan, hỗ trợ điều hướng nhanh.
