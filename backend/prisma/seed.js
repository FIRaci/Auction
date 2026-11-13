const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const onlyIfEmpty = process.argv.includes('--if-empty');
  if (onlyIfEmpty) {
    const existingRooms = await prisma.room.count();
    if (existingRooms > 0) {
      console.log(`--- Database đã có ${existingRooms} phòng đấu giá, bỏ qua seed (--if-empty) ---`);
      return;
    }
  }

  console.log('--- Bắt đầu khởi tạo dữ liệu mẫu thực tế (Seeding Database) ---');

  await prisma.auctionEventLog.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.roomParticipant.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.systemSetting.deleteMany({});

  await prisma.systemSetting.createMany({
    data: [
      { key: 'MIN_BID_INCREMENT', value: '10000', description: 'Bước giá tối thiểu (VNĐ)' },
      { key: 'IDLE_TIMEOUT_SECONDS', value: '180', description: 'Thời gian chờ sau lần đặt giá (3 phút = 180s)' },
      { key: 'CALL_INTERVAL_SECONDS', value: '30', description: 'Khoảng cách giữa các lần thông báo (30s)' },
      { key: 'DEMO_FAST_FORWARD', value: 'false', description: 'Chế độ demo rút ngắn thời gian để nghiệm thu' },
    ],
  });

  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const memberPasswordHash = await bcrypt.hash('Member@123456', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@royalauction.vn',
      fullName: 'Nguyễn Minh Hoàng (Chủ Tọa Hội Đồng)',
      passwordHash: adminPasswordHash,
      phone: '0901234567',
      role: 'ADMIN',
      balance: 50000000000,
    },
  });

  const bidder1 = await prisma.user.create({
    data: {
      email: 'bidder1@royalauction.vn',
      fullName: 'Trần Minh Quân (Nhà Sưu Tầm)',
      passwordHash: memberPasswordHash,
      phone: '0912345678',
      role: 'MEMBER',
      balance: 25000000000,
    },
  });

  const bidder2 = await prisma.user.create({
    data: {
      email: 'bidder2@royalauction.vn',
      fullName: 'Lê Hoàng Yến (Giám Tuyển Gallery)',
      passwordHash: memberPasswordHash,
      phone: '0987654321',
      role: 'MEMBER',
      balance: 18000000000,
    },
  });

  const bidder3 = await prisma.user.create({
    data: {
      email: 'bidder3@royalauction.vn',
      fullName: 'Nguyễn Đăng Khoa (Nhà Đầu Tư)',
      passwordHash: memberPasswordHash,
      phone: '0933445566',
      role: 'MEMBER',
      balance: 30000000000,
    },
  });

  console.log('✓ Đã tạo tài khoản Admin và 3 Members');

  const room1 = await prisma.room.create({
    data: {
      title: 'Geneva & Flagship Collector: Đồng Hồ Patek Philippe, Rolex & Thiết Bị Hi-End',
      description:
        'Phiên đấu giá trực tiếp các tuyệt tác cơ khí Thụy Sĩ, máy ảnh Leica Wetzlar và thiết bị công nghệ đỉnh cao. Kiểm định chính hãng 100%, giao dịch minh bạch theo thời gian thực.',
      code: 'SERKO-LUX-01',
      status: 'LIVE',
      createdById: admin.id,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      title: "Christie's & Le Auctions Heritage: Kiệt Tác Hội Họa Đông Dương & Cổ Vật Hoàng Gia",
      description:
        'Tuyển chọn tranh lụa, gốm Chu Đậu thời Lê Sơ và túi da chế tác thủ công Paris kèm đầy đủ hồ sơ xuất xứ và chứng thư giám định.',
      code: 'SERKO-ART-02',
      status: 'LIVE',
      createdById: admin.id,
    },
  });

  const room3 = await prisma.room.create({
    data: {
      title: 'Motorsport & Iconic Industrial Design: Porsche 911 GT3 RS & Phiên Bản Giới Hạn',
      description:
        'Phiên chuyên đề dành cho giới sưu tầm siêu xe thể thao và ấn phẩm công nghiệp giới hạn toàn cầu có đánh số thứ tự.',
      code: 'SERKO-AUTO-03',
      status: 'UPCOMING',
      createdById: admin.id,
    },
  });

  const itemsRoom1 = [
    {
      roomId: room1.id,
      title: 'Patek Philippe Nautilus Ref. 5711/1A-010 Mặt Số Xanh (Full Box & Certificate)',
      description:
        'Biểu tượng huyền thoại của nghệ thuật chế tác đồng hồ Geneva: vỏ thép không gỉ 40mm chải xước satin, bộ máy Calibre 26-330 S C lộ đáy sapphire, đầy đủ hộp gỗ, sổ và Certificate of Origin.',
      category: 'Đồng Hồ Thụy Sĩ',
      imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85',
      startingPrice: 185000000,
      buyNowPrice: 420000000,
      currentPrice: 185000000,
      minIncrement: 10000,
      status: 'BIDDING',
      queueOrder: 1,
      sellerId: bidder1.id,
    },
    {
      roomId: room1.id,
      title: 'Rolex Cosmograph Daytona Ref. 116500LN "Panda" Cerachrom Bezel',
      description:
        'Phiên bản mặt trắng kim đen kinh điển kết hợp vành gốm Cerachrom đen nguyên khối chống trầy xước, bộ máy Calibre 4130 đạt chuẩn Superlative Chronometer, tình trạng NOS chưa qua đánh bóng.',
      category: 'Đồng Hồ Thụy Sĩ',
      imageUrl: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85',
      startingPrice: 145000000,
      buyNowPrice: 310000000,
      currentPrice: 145000000,
      minIncrement: 10000,
      status: 'WAITING',
      queueOrder: 2,
      sellerId: bidder2.id,
    },
    {
      roomId: room1.id,
      title: 'Leica M11 Monochrom + Ống Kính APO-Summicron-M 50mm f/2 ASPH (Wetzlar, Germany)',
      description:
        'Thân máy rangefinder cảm biến BSI CMOS 60MP chuyên biệt đen trắng cùng ống kính apochromatic sắc nét bậc nhất của Leica Wetzlar. Đủ hộp bạc, dây da thủ công và giấy kiểm định quang học.',
      category: 'Nhiếp Ảnh Cổ Điển',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
      startingPrice: 95000000,
      buyNowPrice: 215000000,
      currentPrice: 95000000,
      minIncrement: 10000,
      status: 'WAITING',
      queueOrder: 3,
      sellerId: bidder3.id,
    },
    {
      roomId: room1.id,
      title: 'Apple MacBook Pro 16" M4 Max (16-Core CPU / 40-Core GPU / 128GB RAM / 4TB SSD)',
      description:
        'Cấu hình CTO cao cấp nhất màu Space Black với màn hình Liquid Retina XDR Nano-texture chống chói, nguyên seal chính hãng Apple kèm gói bảo hành AppleCare+ 3 năm.',
      category: 'Công Nghệ Flagship',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85',
      startingPrice: 68000000,
      buyNowPrice: 118000000,
      currentPrice: 68000000,
      minIncrement: 10000,
      status: 'WAITING',
      queueOrder: 4,
      sellerId: admin.id,
    },
  ];

  const itemsRoom2 = [
    {
      roomId: room2.id,
      title: 'Lê Phổ (1907–2001) — "Thiếu Nữ Bên Hoa Mẫu Đơn" (Mực nho & bột màu trên lụa, 1938)',
      description:
        'Tác phẩm tiêu biểu thời kỳ tiền chiến của danh họa trường Cao đẳng Mỹ thuật Đông Dương, bố cục thanh nhã, sắc độ lụa tơ tằm nguyên bản, kèm hồ sơ xác thực tư liệu lưu trữ Paris.',
      category: 'Hội Họa Đông Dương',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=85',
      startingPrice: 120000000,
      buyNowPrice: 280000000,
      currentPrice: 120000000,
      minIncrement: 10000,
      status: 'BIDDING',
      queueOrder: 1,
      sellerId: bidder2.id,
    },
    {
      roomId: room2.id,
      title: 'Bình Gốm Hoa Lam Chu Đậu Vẽ Rồng Năm Móng (Thế kỷ XV - Triều Lê Sơ)',
      description:
        'Hiện vật gốm hoa lam Chu Đậu niên đại thế kỷ XV, cốt gốm đanh chắc, men lam tro trấu rạn tự nhiên cùng họa tiết rồng ẩn mây tinh xảo.',
      category: 'Cổ Vật Hoàng Gia',
      imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85',
      startingPrice: 55000000,
      buyNowPrice: 135000000,
      currentPrice: 55000000,
      minIncrement: 10000,
      status: 'WAITING',
      queueOrder: 2,
      sellerId: bidder1.id,
    },
    {
      roomId: room2.id,
      title: 'Hermès Birkin 25 Togo Leather Gold Hardware (Stamp W - Faubourg Saint-Honoré)',
      description:
        'Chế tác thủ công hoàn toàn tại Paris từ da bê Togo màu Gold đặc trưng cùng khóa mạ vàng 18k, đầy đủ hóa đơn gốc boutique Faubourg Saint-Honoré, clochette, ổ khóa và dustbag.',
      category: 'Thời Trang Xa Xỉ',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
      startingPrice: 160000000,
      buyNowPrice: 350000000,
      currentPrice: 160000000,
      minIncrement: 10000,
      status: 'WAITING',
      queueOrder: 3,
      sellerId: bidder3.id,
    },
  ];

  const itemsRoom3 = [
    {
      roomId: room3.id,
      title: 'Porsche 911 GT3 RS (992) Weissach Package — Ice Grey Metallic (ODO 680 km)',
      description:
        'Cỗ máy đường đua hợp pháp trang bị động cơ hút khí tự nhiên 4.0L 525 mã lực, gói giảm trọng lượng sợi carbon Weissach, phanh gốm PCCB và hệ thống khí động học chủ động DRS.',
      category: 'Siêu Xe Sưu Tầm',
      imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=85',
      startingPrice: 450000000,
      buyNowPrice: 890000000,
      currentPrice: 450000000,
      minIncrement: 10000,
      status: 'WAITING',
      queueOrder: 1,
      sellerId: bidder1.id,
    },
    {
      roomId: room3.id,
      title: 'Sony PlayStation 5 Pro — 30th Anniversary Limited Edition Bundle (Số #0088/12300)',
      description:
        'Phiên bản kỷ niệm 30 năm phối màu xám cổ điển PS1 sản xuất giới hạn 12.300 bộ trên toàn cầu, khắc laser số thứ tự #0088, kèm DualSense Edge và PlayStation Portal đồng bộ.',
      category: 'Ấn Phẩm Giới Hạn',
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=85',
      startingPrice: 28000000,
      buyNowPrice: 65000000,
      currentPrice: 28000000,
      minIncrement: 10000,
      status: 'WAITING',
      queueOrder: 2,
      sellerId: bidder3.id,
    },
    {
      roomId: room3.id,
      title: 'Bang & Olufsen Beolab 90 Flagship Active Loudspeakers (8.200W / Titanium & Oak)',
      description:
        'Cặp loa đầu bảng từ Đan Mạch sở hữu 18 củ loa Scan-Speak công suất 8.200W mỗi bên, công nghệ Active Room Compensation kiểm soát chùm âm 360 độ hoàn hảo.',
      category: 'Âm Thanh Hi-End',
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=85',
      startingPrice: 220000000,
      buyNowPrice: 480000000,
      currentPrice: 220000000,
      minIncrement: 10000,
      status: 'WAITING',
      queueOrder: 3,
      sellerId: admin.id,
    },
  ];

  for (const itemData of [...itemsRoom1, ...itemsRoom2, ...itemsRoom3]) {
    const createdItem = await prisma.item.create({ data: itemData });
    if (createdItem.status === 'BIDDING') {
      await prisma.room.update({
        where: { id: createdItem.roomId },
        data: { currentItemId: createdItem.id },
      });
    }
  }

  // Tạo sẵn một số bid lịch sử thực tế cho lô 1 của Phòng 1 để giao diện Live Console phong phú ngay từ đầu
  const patekItem = await prisma.item.findFirst({
    where: { roomId: room1.id, queueOrder: 1 },
  });

  if (patekItem) {
    await prisma.bid.createMany({
      data: [
        { itemId: patekItem.id, bidderId: bidder2.id, amount: 185050000 },
        { itemId: patekItem.id, bidderId: bidder3.id, amount: 185100000 },
      ],
    });
    await prisma.item.update({
      where: { id: patekItem.id },
      data: { currentPrice: 185100000 },
    });
    await prisma.auctionEventLog.createMany({
      data: [
        {
          roomId: room1.id,
          itemId: patekItem.id,
          eventType: 'NEXT_ITEM',
          message: `Lô "${patekItem.title}" chính thức lên sàn với giá khởi điểm 185.000.000 VNĐ.`,
        },
        {
          roomId: room1.id,
          itemId: patekItem.id,
          eventType: 'BID',
          message: 'Lê Hoàng Yến đã nâng giá lên 185.050.000 VNĐ (+50.000 VNĐ)',
        },
        {
          roomId: room1.id,
          itemId: patekItem.id,
          eventType: 'BID',
          message: 'Nguyễn Đăng Khoa đã nâng giá lên 185.100.000 VNĐ (+50.000 VNĐ)',
        },
      ],
    });
  }

  console.log('✓ Đã tạo 3 phòng đấu giá với 10 hiện vật thật cao cấp');
  console.log('--- Hoàn tất Seeding Database thành công! ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
