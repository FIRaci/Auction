# QUY CHẾ HOẠT ĐỘNG & BẢNG QUY ĐỊNH VỀ QUYỀN VÀ NGHĨA VỤ TRÊN SÀN ĐẤU GIÁ TRỰC TUYẾN ROYALAUCTION

*(Ban hành theo Quyết định số 01/2026/QĐ-ROYAL của Hội đồng Quản trị & Điều hành Sàn Đấu Giá Trực Tuyến RoyalAuction, căn cứ theo Luật Thương mại số 36/2005/QH11, Luật Đấu giá tài sản số 01/2016/QH14, Luật Giao dịch điện tử số 20/2023/QH15 và các văn bản hướng dẫn thi hành)*

---

## LỜI MỞ ĐẦU
Sàn đấu giá trực tuyến RoyalAuction (sau đây gọi tắt là "Hệ thống" hoặc "Sàn") là nền tảng công nghệ số cung cấp giải pháp tổ chức đấu giá trực tuyến minh bạch, chuẩn mực cho các tài sản mỹ thuật, cổ vật hoàng gia, bộ sưu tập quý hiếm và tài sản thương mại có giá trị cao.

Bản Quy chế này là hợp đồng dịch vụ điện tử có giá trị pháp lý ràng buộc giữa Đơn vị vận hành Sàn, Người bán (Người ký gửi tài sản), Người tham gia đấu giá (Người mua tiềm năng) và Người trúng đấu giá. Mọi cá nhân, tổ chức khi đăng ký tài khoản, gửi vật phẩm bán hoặc tham gia phiên đấu giá trên Hệ thống đều được xem là đã đọc kỹ, hiểu rõ, tự nguyện cam kết tuân thủ toàn bộ các điều khoản dưới đây.

---

## CHƯƠNG I: QUY ĐỊNH CHUNG & GIẢI THÍCH TỪ NGỮ

### Điều 1. Giải thích từ ngữ
Trong Quy chế này, các thuật ngữ dưới đây được hiểu như sau:
1. **Đơn vị vận hành Sàn (Platform / Ban Quản trị)**: Công ty Cổ phần Sàn Đấu Giá Trực Tuyến RoyalAuction, pháp nhân sở hữu, duy trì hạ tầng kỹ thuật, điều hành phiên đấu giá và giám sát tuân thủ.
2. **Người bán (Seller / Bên Ký Gửi)**: Cá nhân hoặc tổ chức sở hữu hợp pháp hoặc được ủy quyền hợp pháp để đưa vật phẩm/tài sản lên bán đấu giá trên Sàn.
3. **Người tham gia đấu giá (Bidder)**: Cá nhân đủ 18 tuổi có năng lực hành vi dân sự đầy đủ hoặc tổ chức hợp pháp đã đăng ký tài khoản, đáp ứng điều kiện tham gia và vào phòng đấu giá.
4. **Người trúng đấu giá (Winner / Buyer)**: Người tham gia đấu giá có mức đặt giá hợp lệ cao nhất được Hệ thống ghi nhận và gõ búa chốt giá (Hammer Down), hoặc người chấp nhận mua ngay (Buy Now).
5. **Phòng đấu giá (Auction Room)**: Không gian ảo thời gian thực được mã hóa trên nền tảng WebSocket, nơi diễn ra phiên đấu giá cho một danh mục các lô hàng xác định.
6. **Lô vật phẩm (Lot / Item)**: Một hiện vật hoặc một nhóm hiện vật được đánh số thứ tự (Mã lô) đưa ra bán đấu giá trong một phiên.
7. **Giá khởi điểm (Starting Price)**: Mức giá thấp nhất do Người bán đề xuất và được Sàn chấp thuận để bắt đầu đấu giá một lô vật phẩm.
8. **Bước giá (Bid Increment)**: Mức chênh lệch tối thiểu giữa giá đặt sau so với giá đặt trước liền kề. Trên RoyalAuction, bước giá tối thiểu bắt buộc là **10.000 VNĐ** (Mười nghìn đồng) hoặc bội số của bước giá do Sàn quy định.
9. **Giá mua ngay (Buy Now Price)**: Mức giá cố định do Người bán niêm yết mà tại đó bất kỳ Người tham gia đấu giá nào cũng có quyền mua ngay lập tức mà không cần qua tiến trình đấu giá trả giá.
10. **Lệnh gõ búa (Hammer Down / Chốt Lô)**: Khoảnh khắc Hệ thống tự động xác lập giao dịch thành công cho người trả giá cao nhất sau khi hoàn tất chu kỳ đếm ngược 3 lần thông báo hoặc khi có lệnh mua ngay.

---

## CHƯƠNG II: NGUYÊN TẮC VẬN HÀNH & QUY TRÌNH PHIÊN ĐẤU GIÁ TRỰC TUYẾN

### Điều 2. Nguyên tắc "Mỗi người chỉ tham gia một phòng tại một thời điểm"
1. Nhằm bảo đảm sự tập trung, chống đầu cơ ảo và tuân thủ giới hạn tài chính phiên, **tại bất kỳ một thời điểm nào, mỗi tài khoản thành viên chỉ được phép tham gia và hiện diện tại DUY NHẤT 01 (MỘT) phòng đấu giá**.
2. Cơ chế thực thi kỹ thuật: Khi một thành viên đang ở Phòng A mà thực hiện thao tác vào Phòng B:
   - Hệ thống máy chủ tự động ngắt kết nối WebSocket của thành viên đó tại Phòng A;
   - Cập nhật giải phóng bản ghi tham gia (`RoomParticipant`) của Phòng A và ghi nhận vào Phòng B;
   - Thành viên sẽ nhận thông báo chuyển phòng rõ ràng trên giao diện.

### Điều 3. Quản lý hàng đợi vật phẩm theo nguyên tắc FIFO (First-In, First-Out)
1. Các lô vật phẩm đã được duyệt trong phòng sẽ được sắp xếp vào hàng đợi (`Item Queue`) theo thứ tự định sẵn (`queueOrder`).
2. Khi phiên đấu giá bắt đầu (`LIVE`), lô vật phẩm số 01 sẽ tự động được đưa lên sàn (`BIDDING`).
3. Toàn bộ các lô tiếp theo giữ trạng thái chờ (`WAITING`).
4. Khi lô hiện tại kết thúc (bằng hình thức đấu giá thành công, mua ngay, hoặc không có người mua `UNSOLD`), Hệ thống tự động chuyển lô tiếp theo lên sàn theo đúng thứ tự hàng đợi mà không cần dừng phiên.

### Điều 4. Quy tắc đặt giá & Bộ đếm thời gian 3 phút + 3 lần thông báo
1. **Điều kiện đặt giá hợp lệ**:
   $$\text{Giá Đặt Mới} \ge \text{Giá Hiện Tại} + \text{Bước Giá Tối Thiểu (10.000 VNĐ)}$$
   Mọi lệnh đặt giá thấp hơn điều kiện trên sẽ bị máy chủ từ chối ngay lập tức và trả thông báo lỗi.
2. **Bộ đếm thời gian nhàn rỗi (Idle Timeout - 3 phút)**:
   - Sau khi vật phẩm lên sàn hoặc sau mỗi lần có lệnh đặt giá hợp lệ mới, Hệ thống kích hoạt chu kỳ chờ **3 phút (180 giây)**.
   - Nếu trong khoảng thời gian 3 phút này xuất hiện lệnh đặt giá mới cao hơn, đồng hồ 3 phút sẽ được lập trình cài đặt lại từ đầu (Reset Timer).
3. **Quy trình 3 lần thông báo (3-Call Countdown)**:
   - Sau 3 phút trôi qua mà không có bất kỳ ai trả giá cao hơn, Hệ thống sẽ tự động kích hoạt tiến trình chốt giá 3 lần:
     - **Thông báo lần 1**: Hệ thống phát tín hiệu cảnh báo trên toàn phòng *"Đếm lần thứ nhất: [Mức giá] của [Người tham gia]!"*.
     - Sau **30 giây** kể từ thông báo lần 1, nếu vẫn không có ai trả giá cao hơn: Hệ thống phát **Thông báo lần 2** *"Đếm lần thứ hai: [Mức giá] của [Người tham gia]!"*.
     - Sau **30 giây** kể từ thông báo lần 2, nếu vẫn không có ai trả giá cao hơn: Hệ thống phát **Thông báo lần 3** *"Đếm lần thứ ba: [Mức giá] của [Người tham gia]!"*.
   - Trong quá trình phát 3 lần thông báo này, nếu bất kỳ thành viên nào đặt mức giá mới hợp lệ cao hơn, toàn bộ tiến trình 3 lần thông báo lập tức bị hủy bỏ, mức giá mới được công nhận và đồng hồ 3 phút bắt đầu đếm lại.
4. **Gõ búa chốt giá (Hammer Down)**:
   - Sau khi Thông báo lần 3 hoàn tất (sau 30 giây của lần 3) mà không có giá mới: Hệ thống tự động thực hiện lệnh gõ búa, công bố Người trúng đấu giá, ghi nhận trạng thái vật phẩm là `SOLD`, lập biên bản điện tử và tự động chuyển sang lô hàng tiếp theo trong hàng đợi FIFO.

### Điều 5. Quy chế Mua ngay (Buy Now)
1. Tại bất kỳ thời điểm nào khi lô vật phẩm đang trong tiến trình đấu giá (`BIDDING`), bất kỳ người tham gia nào trong phòng cũng có quyền kích hoạt tính năng **Mua Ngay** với mức giá niêm yết `buyNowPrice`.
2. Khi lệnh Mua Ngay được máy chủ xác nhận:
   - Lô hàng được bán đứt ngay lập tức cho người bấm Mua Ngay mà không cần tiếp tục đấu giá;
   - Toàn bộ các bộ đếm giờ và thông báo đấu giá bị hủy bỏ tức thì;
   - Giao dịch được khóa và hệ thống chuyển sang lô kế tiếp trong hàng đợi.

---

## CHƯƠNG III: QUYỀN VÀ NGHĨA VỤ CỦA NGƯỜI THAM GIA ĐẤU GIÁ (NGƯỜI MUA)

### Điều 6. Quyền của Người tham gia đấu giá
1. Được tiếp cận công khai, minh bạch toàn bộ thông tin mô tả, xuất xứ, hình ảnh, tình trạng hiện vật, giá khởi điểm, giá mua ngay và bước giá của lô hàng trước và trong phiên đấu giá.
2. Được tự do đặt giá theo ý chí cá nhân, miễn là đáp ứng điều kiện bước giá hợp lệ và số dư/hạn mức quy định.
3. Được quyền sử dụng tính năng "Mua ngay" để sở hữu vật phẩm mà không phải cạnh tranh giá.
4. Được bảo mật thông tin cá nhân và định danh đấu giá (Hệ thống hỗ trợ hiển thị dưới dạng mã danh tính hoặc tên viết tắt an toàn).
5. Được quyền khiếu nại, yêu cầu hỗ trợ kỹ thuật hoặc thẩm định lại hiện vật nếu phát hiện hiện vật có sự sai lệch nghiêm trọng so với mô tả được duyệt trên Sàn.

### Điều 7. Nghĩa vụ của Người tham gia đấu giá
1. **Tuân thủ quy định phòng đơn**: Chấp hành quy định chỉ tham gia 01 phòng tại 01 thời điểm; không sử dụng nhiều tài khoản hoặc công cụ tự động can thiệp trái phép để vào nhiều phòng cùng lúc.
2. **Trách nhiệm pháp lý đối với lệnh đặt giá**: Lệnh đặt giá một khi đã được gửi lên máy chủ và xác nhận là không thể rút lại hoặc hủy bỏ vì bất kỳ lý do cá nhân nào.
3. **Nghĩa vụ thanh toán**:
   - Trong vòng **24 giờ** sau khi trúng đấu giá: Thanh toán khoản tiền đặt cọc tương đương **10%** giá trị trúng đấu giá hoặc giá mua ngay.
   - Trong vòng **07 (bảy) ngày làm việc** kể từ ngày kết thúc phiên: Thanh toán toàn bộ số tiền còn lại (90% kèm phí dịch vụ đấu giá theo quy định).
4. **Nghĩa vụ nhận bàn giao hiện vật**: Sau khi hoàn tất 100% nghĩa vụ thanh toán, người mua có nghĩa vụ nhận bàn giao hiện vật trong thời hạn tối đa **30 ngày**. Chi phí vận chuyển, bảo hiểm do người mua chi trả.
5. **Cấm thông đồng, dìm giá**: Nghiêm cấm mọi hành vi liên kết, thông đồng giữa các người mua để dìm giá, ép giá hoặc lũng đoạn phiên đấu giá.

---

## CHƯƠNG IV: QUYỀN VÀ NGHĨA VỤ CỦA NGƯỜI BÁN (BÊN KÝ GỬI)

### Điều 8. Quyền của Người bán
1. Tự do quyết định Giá khởi điểm và Giá mua ngay (Buy Now) cho vật phẩm của mình, phù hợp với khung tư vấn định giá của Sàn.
2. Được nhận đầy đủ số tiền bán tài sản sau khi trừ phí hoa hồng sàn (mặc định 5% - 8% tùy danh mục) trong vòng **03 ngày làm việc** kể từ khi người mua hoàn tất thanh toán.
3. Được quyền yêu cầu Sàn bảo quản hiện vật an toàn trong suốt thời gian lưu kho trưng bày trước phiên đấu giá.

### Điều 9. Nghĩa vụ của Người bán
1. **Cam kết tính hợp pháp và quyền sở hữu**: Người bán cam đoan và bảo đảm mình là chủ sở hữu hợp pháp duy nhất của vật phẩm hoặc được ủy quyền định đoạt hợp pháp; vật phẩm không bị tranh chấp, không bị kê biên cầm cố, không vi phạm pháp luật bảo tồn di sản văn hóa.
2. **Tính trung thực của thông tin mô tả**: Chịu trách nhiệm pháp lý hoàn toàn về tính xác thực của các thông tin, hình ảnh, tài liệu niên đại cung cấp cho Sàn.
3. **Không tự đấu giá tài sản của chính mình**: Người bán tuyệt đối không được tự mình hoặc nhờ người thân, nhân viên tham gia đấu giá nhằm mục đích đẩy giá ảo (Shill Bidding) cho vật phẩm của mình. Mọi trường hợp vi phạm sẽ bị khóa tài khoản vĩnh viễn và phạt 20% giá khởi điểm.
4. **Nghĩa vụ bàn giao đúng hẹn**: Bàn giao vật phẩm đúng hiện trạng, giấy tờ chứng nhận kèm theo cho Người trúng đấu giá theo biên bản nghiệm thu của Sàn.

---

## CHƯƠNG V: QUYỀN VÀ TRÁCH NHIỆM CỦA ĐƠN VỊ VẬN HÀNH SÀN (PLATFORM / BAN QUẢN TRỊ)

### Điều 10. Quyền hạn của Ban Quản trị
1. **Quyền kiểm duyệt và xếp hàng**: Có toàn quyền thẩm định, chấp thuận hoặc từ chối đưa một lô vật phẩm lên sàn; quyền sắp xếp và thay đổi thứ tự hàng đợi FIFO của các lô vật phẩm trước phiên.
2. **Quyền điều hành phiên đấu giá**: Đấu giá viên có quyền tạm dừng phiên đấu giá trong trường hợp sự cố mạng diện rộng, lỗi thiên tai hoặc can thiệp kỹ thuật bất khả kháng.
3. **Quyền xử lý gian lận**: Được quyền hủy bỏ lệnh đặt giá gian lận, chặn tài khoản có hành vi phá hoại phiên hoặc vi phạm nghiêm trọng quy chế.
4. **Quyền chuyển đổi chế độ Demo Fast-Forward**: Nhằm phục vụ công tác kiểm thử, đào tạo và nghiệm thu hệ thống, Admin có quyền kích hoạt chế độ thời gian thu gọn mà không làm thay đổi logic thuật toán cốt lõi.

### Điều 11. Trách nhiệm của Ban Quản trị
1. Duy trì hạ tầng kỹ thuật máy chủ ổn định, bảo đảm độ trễ cực thấp (Low Latency) cho kết nối WebSocket thời gian thực.
2. Bảo mật toàn bộ dữ liệu người dùng, nhật ký đặt giá (`AuctionEventLog`), mật khẩu và giao dịch tài chính theo tiêu chuẩn mã hóa quốc tế.
3. Hoạt động như một trọng tài độc lập, minh bạch, bảo vệ quyền lợi chính đáng của cả Người bán lẫn Người mua theo đúng quy định của pháp luật.

---

## CHƯƠNG VI: THANH TOÁN, ĐẶT CỌC VÀ CHẾ TÀI XỬ LÝ VI PHẠM

### Điều 12. Chế tài đối với hành vi Bỏ đấu giá (Default on Payment)
1. Trường hợp Người trúng đấu giá từ chối thanh toán hoặc quá thời hạn 07 ngày làm việc mà không thanh toán đủ tiền:
   - Toàn bộ số tiền cọc (10%) sẽ bị **tịch thu vô điều kiện** để bù đắp chi phí tổ chức phiên và bồi thường thiệt hại cho Người bán (tỷ lệ phân chia: 50% cho Người bán, 50% cho chi phí vận hành Sàn).
   - Hệ thống có quyền hủy kết quả đấu giá của người này và tự động liên hệ với Người trả giá cao thứ nhì (nếu mức giá chênh lệch không quá 5%) hoặc đưa lô hàng vào phiên đấu giá tiếp theo.
   - Tài khoản vi phạm sẽ bị khóa vĩnh viễn quyền tham gia đấu giá trên toàn hệ thống RoyalAuction.

### Điều 13. Xử lý tranh chấp và khiếu nại
1. Mọi khiếu nại phát sinh liên quan đến phiên đấu giá phải được gửi về Ban Quản trị RoyalAuction bằng văn bản hoặc email chính thức trong vòng **48 giờ** kể từ thời điểm gõ búa.
2. Các bên ưu tiên thương lượng, hòa giải trên tinh thần tôn trọng quyền lợi đôi bên.
3. Trường hợp không thể tự thỏa thuận, tranh chấp sẽ được đưa ra giải quyết tại Tòa án nhân dân có thẩm quyền tại Việt Nam theo pháp luật hiện hành.

---

## CHƯƠNG VII: HIỆU LỰC THI HÀNH
1. Bản Quy chế này có hiệu lực kể từ ngày công bố trên nền tảng RoyalAuction.
2. Sàn có quyền sửa đổi, bổ sung Quy chế theo yêu cầu thực tiễn và quy định pháp luật mới nhất. Mọi nội dung sửa đổi sẽ được thông báo công khai trước ít nhất 03 ngày làm việc trước khi áp dụng.

**TM. HỘI ĐỒNG ĐIỀU HÀNH SÀN ĐẤU GIÁ TRỰC TUYẾN ROYALAUCTION**  
*(Đã ký điện tử & Ban hành trên toàn hệ thống)*

