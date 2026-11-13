const prisma = require('../config/prisma');
const auctionEngine = require('../services/auctionEngine');

async function createItem(req, res) {
  try {
    const {
      roomId,
      title,
      description,
      category,
      imageUrl,
      startingPrice,
      buyNowPrice,
      minIncrement,
    } = req.body;

    const sellerId = req.user.id;

    if (!roomId || !title || !description || startingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ: ID phòng, Tên vật phẩm, Mô tả và Giá khởi điểm',
      });
    }

    const startPrice = parseFloat(startingPrice);
    const hasBuyPrice =
      buyNowPrice !== undefined &&
      buyNowPrice !== null &&
      String(buyNowPrice).trim() !== '' &&
      Number(buyNowPrice) > 0;
    const buyPrice = hasBuyPrice ? parseFloat(buyNowPrice) : null;
    const minInc = minIncrement ? parseFloat(minIncrement) : 10000;

    if (isNaN(startPrice) || startPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Giá khởi điểm phải là một số dương hợp lệ' });
    }

    if (buyPrice !== null && (isNaN(buyPrice) || buyPrice <= startPrice)) {
      return res.status(400).json({ success: false, message: 'Giá chốt (nếu có) phải lớn hơn giá khởi điểm' });
    }

    if (minInc < 10000) {
      return res.status(400).json({ success: false, message: 'Bước giá tối thiểu theo quy định là 10.000 VNĐ' });
    }

    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId, 10) },
      include: { items: true },
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Phòng đấu giá không tồn tại' });
    }

    // Tính thứ tự hàng đợi FIFO kế tiếp
    const maxOrder = room.items.reduce((max, i) => Math.max(max, i.queueOrder), 0);
    const nextQueueOrder = maxOrder + 1;

    // Trạng thái ban đầu: Nếu phòng LIVE và chưa có item nào đang BIDDING -> có thể cho lên BIDDING luôn, ngược lại WAITING
    const hasActiveItem = room.items.some((i) => i.status === 'BIDDING');
    const status = !hasActiveItem && room.status === 'LIVE' ? 'BIDDING' : 'WAITING';

    const newItem = await prisma.item.create({
      data: {
        roomId: room.id,
        title,
        description,
        category: category || 'Nghệ Thuật & Sưu Tầm',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
        startingPrice: startPrice,
        buyNowPrice: buyPrice,
        currentPrice: startPrice,
        minIncrement: minInc,
        status,
        queueOrder: nextQueueOrder,
        sellerId,
      },
      include: {
        seller: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (status === 'BIDDING') {
      await prisma.room.update({
        where: { id: room.id },
        data: { currentItemId: newItem.id },
      });
      auctionEngine.startIdleTimer(room.id);
    }

    // Ghi log
    await prisma.auctionEventLog.create({
      data: {
        roomId: room.id,
        itemId: newItem.id,
        eventType: 'ITEM_REGISTERED',
        message: `${req.user.fullName} đã đăng ký bán đấu giá lô "${newItem.title}" (Lô #${nextQueueOrder} trong hàng đợi).`,
      },
    });

    // Thông báo cho mọi người trong phòng
    if (auctionEngine.io) {
      auctionEngine.io.to(`room_${room.id}`).emit('item_added_to_queue', {
        item: newItem,
        queueOrder: nextQueueOrder,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Đăng bán vật phẩm thành công. Vật phẩm đã được thêm vào hàng đợi của phiên.',
      data: newItem,
    });
  } catch (error) {
    console.error('Lỗi createItem:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng bán vật phẩm' });
  }
}

async function getItemById(req, res) {
  try {
    const itemId = parseInt(req.params.id, 10);
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        seller: { select: { id: true, fullName: true, email: true } },
        winner: { select: { id: true, fullName: true, email: true } },
        bids: {
          orderBy: { createdAt: 'desc' },
          include: { bidder: { select: { id: true, fullName: true } } },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vật phẩm' });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    console.error('Lỗi getItemById:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết vật phẩm' });
  }
}

module.exports = {
  createItem,
  getItemById,
};

