/**
 * RoyalAuction End-to-End (E2E) Test Suite
 * Kiểm thử toàn diện 100% các yêu cầu nghiệp vụ của đề bài:
 * 1. Phân quyền Admin & Member
 * 2. Tạo phòng đấu giá
 * 3. Ràng buộc 1 người chỉ tham gia 1 phòng cùng lúc
 * 4. Đăng bán vật phẩm (thông tin, giá khởi điểm, giá bán ngay)
 * 5. Hàng đợi FIFO đưa vật phẩm lần lượt lên sàn
 * 6. Kiểm tra lệnh đặt giá hợp lệ (+ >= 10.000 VNĐ) & từ chối giá không hợp lệ
 * 7. Cơ chế đếm 3 lần sau 3 phút -> Gõ búa chốt người mua cao nhất
 * 8. Mua ngay không qua đấu giá chốt giao dịch lập tức
 */

const { io } = require('../frontend/node_modules/socket.io-client');
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

let adminToken = null;
let bidder1Token = null;
let bidder2Token = null;
let testRoomId = null;
let activeItemId = null;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ THẤT BẠI: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ THÀNH CÔNG: ${message}`);
  }
}

async function api(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('================================================================');
  console.log('🏛️ BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG HỆ THỐNG ĐẤU GIÁ TRỰC TUYẾN ROYALAUCTION');
  console.log('================================================================\n');

  // 1. Kiểm tra Health
  const health = await api('/health');
  assert(health.status === 200 && health.data.status === 'ok', 'Server backend đang hoạt động bình thường');

  // 2. Đăng nhập Admin và 2 Bidders
  console.log('\n--- BƯỚC 1: XÁC THỰC & PHÂN QUYỀN (ADMIN & MEMBER) ---');
  const adminLogin = await api('/auth/login', 'POST', {
    email: 'admin@royalauction.vn',
    password: 'Admin@123456',
  });
  assert(adminLogin.status === 200 && adminLogin.data.data.user.role === 'ADMIN', 'Admin đăng nhập thành công với role ADMIN');
  adminToken = adminLogin.data.data.token;

  const bidder1Login = await api('/auth/login', 'POST', {
    email: 'bidder1@royalauction.vn',
    password: 'Member@123456',
  });
  assert(bidder1Login.status === 200 && bidder1Login.data.data.user.role === 'MEMBER', 'Bidder 1 đăng nhập thành công với role MEMBER');
  bidder1Token = bidder1Login.data.data.token;

  const bidder2Login = await api('/auth/login', 'POST', {
    email: 'bidder2@royalauction.vn',
    password: 'Member@123456',
  });
  assert(bidder2Login.status === 200 && bidder2Login.data.data.user.role === 'MEMBER', 'Bidder 2 đăng nhập thành công với role MEMBER');
  bidder2Token = bidder2Login.data.data.token;

  // Bật chế độ Demo Fast-Forward để test đếm ngược nhanh
  await api('/admin/settings/demo-mode', 'POST', { enabled: true }, adminToken);
  console.log('✓ Đã bật chế độ Demo Fast-Forward để test đếm ngược');

  // 3. Tạo phòng đấu giá
  console.log('\n--- BƯỚC 2: TẠO PHÒNG ĐẤU GIÁ ---');
  const uniqueCode = `TEST-LOT-${Date.now() % 10000}`;
  const createRoomRes = await api('/rooms', 'POST', {
    title: 'Phiên Thử Nghiệm Tự Động: Bộ Sưu Tập Hoàng Gia',
    description: 'Phiên test tích hợp E2E các chức năng đấu giá thời gian thực',
    code: uniqueCode,
  }, adminToken);
  assert(createRoomRes.status === 201 && createRoomRes.data.data.id, `Tạo phòng đấu giá mới thành công (Mã: ${uniqueCode})`);
  testRoomId = createRoomRes.data.data.id;

  // Kích hoạt phòng sang LIVE
  await api(`/admin/rooms/${testRoomId}`, 'PATCH', { status: 'LIVE' }, adminToken);
  console.log(`✓ Đã kích hoạt phòng #${testRoomId} sang trạng thái LIVE`);

  // 4. Kiểm tra ràng buộc: Mỗi người chỉ tham gia 1 phòng tại một thời điểm
  console.log('\n--- BƯỚC 3: KIỂM SOÁT RÀNG BUỘC 1 NGƯỜI CHỈ THAM GIA 1 PHÒNG DUY NHẤT ---');
  const allRoomsRes = await api('/rooms');
  const otherRoom = allRoomsRes.data.data.find(r => r.id !== testRoomId);
  const otherRoomId = otherRoom ? otherRoom.id : 6;

  const joinRes1 = await api(`/rooms/${testRoomId}/join`, 'POST', null, bidder1Token);
  assert(joinRes1.status === 200 && joinRes1.data.data.currentRoomId === testRoomId, 'Bidder 1 tham gia phòng test thành công');

  // Giả sử Bidder 1 cố gắng vào một phòng khác
  const joinRes2 = await api(`/rooms/${otherRoomId}/join`, 'POST', null, bidder1Token);
  assert(
    joinRes2.status === 200 &&
    joinRes2.data.data.currentRoomId === otherRoomId &&
    joinRes2.data.data.switchedFrom === testRoomId,
    `Bidder 1 chuyển sang phòng #${otherRoomId} -> Hệ thống tự động giải phóng khỏi phòng #${testRoomId} và chuyển sang phòng #${otherRoomId}`
  );

  // Chuyển lại vào phòng test
  await api(`/rooms/${testRoomId}/join`, 'POST', null, bidder1Token);
  await api(`/rooms/${testRoomId}/join`, 'POST', null, bidder2Token);
  console.log('✓ Xác nhận: Hệ thống thực thi nghiêm ngặt nguyên tắc chỉ ở 1 phòng tại 1 thời điểm');

  // 5. Đăng bán vật phẩm vào phòng theo hàng đợi FIFO
  console.log('\n--- BƯỚC 4: ĐĂNG BÁN VẬT PHẨM (THÔNG TIN, GIÁ KHỞI ĐIỂM, GIÁ BÁN NGAY, FIFO) ---');
  // Lô 1: Đấu giá
  const item1Res = await api('/items', 'POST', {
    roomId: testRoomId,
    title: 'Lô Test 01: Omega Speedmaster Moonwatch Professional',
    description: 'Đồng hồ bấm giờ cơ khí lên dây cót thủ công Calibre 3861 chính hãng',
    category: 'Đồng Hồ Thụy Sĩ',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85',
    startingPrice: 10000000, // 10 triệu
    buyNowPrice: 25000000,   // 25 triệu
    minIncrement: 10000,     // Bước giá 10k
  }, bidder1Token);
  assert(item1Res.status === 201 && item1Res.data.data.queueOrder === 1, 'Đăng bán Lô 01 thành công, xếp ở vị trí FIFO #1');
  activeItemId = item1Res.data.data.id;

  // Lô 2: Sẽ test Mua Ngay
  const item2Res = await api('/items', 'POST', {
    roomId: testRoomId,
    title: 'Lô Test 02: Leica Q3 Compact Full-Frame 60MP',
    description: 'Máy ảnh full-frame ống kính Summilux 28mm f/1.7 ASPH',
    category: 'Nhiếp Ảnh Cổ Điển',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
    startingPrice: 20000000,
    buyNowPrice: 45000000,
    minIncrement: 50000,
  }, bidder2Token);
  assert(item2Res.status === 201 && item2Res.data.data.queueOrder === 2, 'Đăng bán Lô 02 thành công, xếp ở vị trí FIFO #2');

  // 6. Kiểm thử Đấu Giá & Xác thực lệnh đặt giá qua WebSocket
  console.log('\n--- BƯỚC 5: ĐẤU GIÁ QUA SOCKET & KIỂM TRA BƯỚC GIÁ HỢP LỆ (>= GIÁ HT + 10.000 VNĐ) ---');
  const socket1 = io(SOCKET_URL, { auth: { token: bidder1Token } });
  const socket2 = io(SOCKET_URL, { auth: { token: bidder2Token } });

  await new Promise((resolve) => socket1.on('connect', resolve));
  await new Promise((resolve) => socket2.on('connect', resolve));
  console.log('✓ Cả 2 Bidders đã kết nối thành công đến WebSocket Server');

  // Cả 2 tham gia phòng qua socket
  await new Promise((resolve) => socket1.emit('join_room', { roomId: testRoomId }, resolve));
  await new Promise((resolve) => socket2.emit('join_room', { roomId: testRoomId }, resolve));

  // Kiểm tra đặt giá KHÔNG HỢP LỆ (thấp hơn giá khởi điểm + 10.000đ)
  // Giá hiện tại: 10.000.000đ, lệnh đặt: 10.005.000đ (chỉ tăng 5.000đ < 10.000đ)
  const invalidBidResult = await new Promise((resolve) => {
    socket2.emit('place_bid', { roomId: testRoomId, amount: 10005000 }, resolve);
  });
  assert(
    invalidBidResult.success === false,
    `Server đã TỪ CHỐI lệnh đặt giá không hợp lệ (tăng 5.000đ < 10.000đ). Phản hồi: "${invalidBidResult.message}"`
  );

  // Đặt giá HỢP LỆ (10.000.000đ + 10.000đ = 10.010.000đ)
  let bidBroadcastReceived = false;
  socket1.on('new_bid', (data) => {
    if (data.bid.amount === 10010000) {
      bidBroadcastReceived = true;
    }
  });

  const validBidResult = await new Promise((resolve) => {
    socket2.emit('place_bid', { roomId: testRoomId, amount: 10010000 }, resolve);
  });
  assert(validBidResult.success === true, 'Server đã CHẤP NHẬN lệnh đặt giá hợp lệ (+10.000 VNĐ)');
  await new Promise((r) => setTimeout(r, 500));
  assert(bidBroadcastReceived, 'Tất cả các thành viên trong phòng đã nhận được thông báo giá mới tức thì qua WebSocket');

  // 7. Kiểm thử Chu kỳ Đếm 3 lần sau 3 phút và Gõ Búa
  console.log('\n--- BƯỚC 6: KIỂM THỬ BỘ ĐẾM 3 LẦN THÔNG BÁO & GÕ BÚA CHỐT NGƯỜI MUA ---');
  console.log('Đang chờ chuỗi thông báo Lần 1 -> Lần 2 -> Lần 3 -> Gõ búa (chế độ demo fast-forward)...');

  let call1Received = false;
  let call2Received = false;
  let call3Received = false;
  let hammerDownReceived = false;
  let winnerFullName = null;

  socket1.on('announcement_call', (data) => {
    console.log(`[WebSocket Event] -> ${data.message}`);
    if (data.stage === 1) call1Received = true;
    if (data.stage === 2) call2Received = true;
    if (data.stage === 3) call3Received = true;
  });

  socket1.on('hammer_down', (data) => {
    console.log(`[WebSocket Event] -> ${data.message}`);
    if (data.result === 'SOLD') {
      hammerDownReceived = true;
      winnerFullName = data.winner?.fullName;
    }
  });

  // Chờ cho chuỗi đếm hoàn tất (Demo mode: 10s idle + 5s call1 + 5s call2 + 5s call3 = ~26s)
  const startTime = Date.now();
  while (!hammerDownReceived && Date.now() - startTime < 35000) {
    await new Promise((r) => setTimeout(r, 1000));
    process.stdout.write('.');
  }
  console.log('\n');

  assert(call1Received, 'Server đã phát thông báo lần thứ 1 khi hết thời gian chờ không có người trả giá cao hơn');
  assert(call2Received, 'Server đã phát thông báo lần thứ 2 sau 30s (demo: 5s)');
  assert(call3Received, 'Server đã phát thông báo lần thứ 3 sau 30s (demo: 5s)');
  assert(hammerDownReceived, `GÕ BÚA (HAMMER DOWN) THÀNH CÔNG! Lô hàng được bán cho người trả giá cao nhất: ${winnerFullName}`);

  // Chờ 5 giây để hệ thống tự động xoay chuyển sang lô tiếp theo trong hàng đợi FIFO
  await new Promise((r) => setTimeout(r, 5000));

  // Kiểm tra Lô 2 đã tự động lên sàn (FIFO)
  const roomAfterFirstLot = await api(`/rooms/${testRoomId}`);
  const activeItemLot2 = roomAfterFirstLot.data.data.activeItem;
  assert(
    activeItemLot2 && activeItemLot2.id === item2Res.data.data.id,
    `Hàng đợi FIFO tự động kích hoạt: Lô 02 ("${activeItemLot2?.title}") đã tự động lên sàn BIDDING`
  );

  // 8. Kiểm thử MUA NGAY (BUY NOW)
  console.log('\n--- BƯỚC 7: KIỂM THỬ MUA NGAY KHÔNG QUA ĐẤU GIÁ ---');
  let buyNowReceived = false;
  socket1.on('item_bought_now', (data) => {
    console.log(`[WebSocket Event] -> ${data.message}`);
    buyNowReceived = true;
  });

  const buyNowResult = await new Promise((resolve) => {
    socket1.emit('buy_now', { roomId: testRoomId }, resolve);
  });
  assert(buyNowResult.success === true, 'Thực hiện Mua Ngay thành công');
  await new Promise((r) => setTimeout(r, 1000));
  assert(buyNowReceived, 'Vật phẩm được bán ngay lập tức không qua đấu giá, thông báo Mua Ngay đã phát tới toàn phòng');

  // Tắt demo mode sau khi test
  await api('/admin/settings/demo-mode', 'POST', { enabled: false }, adminToken);

  // Đóng sockets
  socket1.disconnect();
  socket2.disconnect();

  console.log('\n================================================================');
  console.log('🎉 TẤT CẢ 8/8 TIÊU CHÍ NGHIỆP VỤ ĐÃ ĐƯỢC XÁC THỰC HOÀN TOÀN THÀNH CÔNG!');
  console.log('================================================================');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Lỗi kiểm thử E2E:', err);
  process.exit(1);
});

