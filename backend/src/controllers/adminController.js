const prisma = require('../config/prisma');
const auctionEngine = require('../services/auctionEngine');

async function getStats(req, res) {
  try {
    const totalUsers = await prisma.user.count();
    const totalRooms = await prisma.room.count();
    const liveRooms = await prisma.room.count({ where: { status: 'LIVE' } });
    const totalItems = await prisma.item.count();
    const soldItems = await prisma.item.findMany({
      where: { status: 'SOLD' },
      select: { soldPrice: true },
    });

    const totalGMV = soldItems.reduce((sum, item) => sum + (item.soldPrice || 0), 0);
    const activeParticipants = await prisma.roomParticipant.count();

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalRooms,
        liveRooms,
        totalItems,
        soldCount: soldItems.length,
        totalGMV,
        activeParticipants,
        demoMode: auctionEngine.config.demoMode,
      },
    });
  } catch (error) {
    console.error('Lỗi getStats:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy thống kê' });
  }
}

async function getAllRooms(req, res) {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, fullName: true, email: true } },
        items: {
          orderBy: { queueOrder: 'asc' },
          include: {
            seller: { select: { id: true, fullName: true } },
            winner: { select: { id: true, fullName: true } },
          },
        },
        participants: {
          include: { user: { select: { id: true, fullName: true } } },
        },
      },
    });

    return res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Lỗi getAllRooms:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách phòng cho Admin' });
  }
}

async function updateRoom(req, res) {
  try {
    const roomId = parseInt(req.params.id, 10);
    const { title, description, status } = req.body;

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
      include: {
        items: { orderBy: { queueOrder: 'asc' } },
      },
    });

    // Nếu chuyển sang LIVE mà chưa có item nào BIDDING -> kích hoạt item đầu tiên
    if (status === 'LIVE') {
      await auctionEngine.initRoom(roomId);
    }

    if (auctionEngine.io) {
      auctionEngine.io.to(`room_${roomId}`).emit('room_updated', updatedRoom);
    }

    return res.json({ success: true, message: 'Cập nhật phòng đấu giá thành công', data: updatedRoom });
  } catch (error) {
    console.error('Lỗi updateRoom:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật phòng' });
  }
}

async function updateItemQueue(req, res) {
  try {
    const { items } = req.body; // Array of { id, queueOrder, status }

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu hàng đợi không hợp lệ' });
    }

    for (const item of items) {
      await prisma.item.update({
        where: { id: item.id },
        data: {
          ...(item.queueOrder !== undefined && { queueOrder: item.queueOrder }),
          ...(item.status && { status: item.status }),
        },
      });
    }

    return res.json({ success: true, message: 'Cập nhật thứ tự hàng đợi thành công' });
  } catch (error) {
    console.error('Lỗi updateItemQueue:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật hàng đợi' });
  }
}

async function toggleDemoMode(req, res) {
  try {
    const { enabled } = req.body;
    const currentMode = auctionEngine.setDemoMode(enabled);

    if (auctionEngine.io) {
      auctionEngine.io.emit('system_setting_changed', {
        setting: 'DEMO_FAST_FORWARD',
        value: currentMode,
      });
    }

    return res.json({
      success: true,
      message: currentMode
        ? 'Đã bật chế độ Demo Fast-Forward (10s chờ, 5s thông báo)'
        : 'Đã chuyển về chế độ chuẩn (3 phút chờ, 30s thông báo)',
      data: { demoMode: currentMode },
    });
  } catch (error) {
    console.error('Lỗi toggleDemoMode:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đổi chế độ' });
  }
}

async function forceHammer(req, res) {
  try {
    const roomId = parseInt(req.params.id, 10);
    const result = await auctionEngine.adminForceHammer(roomId);
    return res.json(result);
  } catch (error) {
    console.error('Lỗi forceHammer:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi gõ búa' });
  }
}

async function skipItem(req, res) {
  try {
    const roomId = parseInt(req.params.id, 10);
    const result = await auctionEngine.adminSkipItem(roomId);
    return res.json(result);
  } catch (error) {
    console.error('Lỗi skipItem:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi bỏ qua lô' });
  }
}

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        balance: true,
        createdAt: true,
        participant: {
          include: { room: { select: { id: true, title: true, code: true } } },
        },
      },
    });

    return res.json({ success: true, data: users });
  } catch (error) {
    console.error('Lỗi getUsers:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách người dùng' });
  }
}

async function updateUserRole(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ (ADMIN hoặc MEMBER)' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, fullName: true, role: true },
    });

    return res.json({ success: true, message: 'Cập nhật vai trò thành công', data: updatedUser });
  } catch (error) {
    console.error('Lỗi updateUserRole:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật vai trò' });
  }
}

module.exports = {
  getStats,
  getAllRooms,
  updateRoom,
  updateItemQueue,
  toggleDemoMode,
  forceHammer,
  skipItem,
  getUsers,
  updateUserRole,
};

