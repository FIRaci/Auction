const prisma = require('../config/prisma');
const PresenceService = require('../services/presenceService');
const auctionEngine = require('../services/auctionEngine');

async function getRooms(req, res) {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, fullName: true } },
        items: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            startingPrice: true,
            buyNowPrice: true,
            currentPrice: true,
            imageUrl: true,
            queueOrder: true,
          },
          orderBy: { queueOrder: 'asc' },
        },
        participants: {
          select: { id: true, userId: true },
        },
      },
    });

    const formattedRooms = rooms.map((room) => {
      const activeItem = room.items.find((i) => i.status === 'BIDDING');
      const previewItem = activeItem || room.items[0] || null;
      const waitingCount = room.items.filter((i) => i.status === 'WAITING').length;
      const soldCount = room.items.filter((i) => i.status === 'SOLD').length;

      return {
        id: room.id,
        title: room.title,
        description: room.description,
        code: room.code,
        status: room.status,
        creator: room.creator,
        totalItems: room.items.length,
        waitingCount,
        soldCount,
        activeItem,
        previewItem,
        participantCount: room.participants.length,
        createdAt: room.createdAt,
      };
    });

    return res.json({ success: true, data: formattedRooms });
  } catch (error) {
    console.error('Lỗi getRooms:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách phòng' });
  }
}

async function getRoomById(req, res) {
  try {
    const roomId = parseInt(req.params.id, 10);
    if (isNaN(roomId)) {
      return res.status(400).json({ success: false, message: 'ID phòng không hợp lệ' });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: { select: { id: true, fullName: true, role: true } },
        items: {
          orderBy: { queueOrder: 'asc' },
          include: {
            seller: { select: { id: true, fullName: true } },
            winner: { select: { id: true, fullName: true } },
            bids: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              include: { bidder: { select: { id: true, fullName: true } } },
            },
          },
        },
        eventLogs: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng đấu giá' });
    }

    // Lấy danh sách thành viên đang có mặt
    const participants = await PresenceService.getRoomMembers(roomId);

    // Nạp hoặc đồng bộ trạng thái từ AuctionEngine
    const activeItem = room.items.find((i) => i.status === 'BIDDING');
    const roomState = auctionEngine.getRoomState(roomId);

    return res.json({
      success: true,
      data: {
        ...room,
        activeItem,
        participants,
        engineState: {
          callStage: roomState.callStage,
          callDeadline: roomState.callDeadline,
          demoMode: auctionEngine.config.demoMode,
        },
      },
    });
  } catch (error) {
    console.error('Lỗi getRoomById:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết phòng' });
  }
}

async function createRoom(req, res) {
  try {
    const { title, description, code } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên phòng đấu giá' });
    }

    const roomCode = code || `ROYAL-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await prisma.room.findUnique({ where: { code: roomCode } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Mã phòng này đã tồn tại, vui lòng chọn mã khác' });
    }

    const newRoom = await prisma.room.create({
      data: {
        title,
        description: description || '',
        code: roomCode,
        status: 'UPCOMING',
        createdById: userId,
      },
      include: {
        creator: { select: { id: true, fullName: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo phòng đấu giá thành công',
      data: newRoom,
    });
  } catch (error) {
    console.error('Lỗi createRoom:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo phòng đấu giá' });
  }
}

async function joinRoom(req, res) {
  try {
    const roomId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Phòng đấu giá không tồn tại' });
    }

    const presenceResult = await PresenceService.joinRoom(userId, roomId);

    return res.json({
      success: true,
      message: presenceResult.switchedFrom
        ? `Đã chuyển từ phòng #${presenceResult.switchedFrom} sang phòng #${roomId}`
        : 'Tham gia phòng thành công',
      data: presenceResult,
    });
  } catch (error) {
    console.error('Lỗi joinRoom:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tham gia phòng' });
  }
}

async function leaveRoom(req, res) {
  try {
    const userId = req.user.id;
    await PresenceService.leaveRoom(userId);

    return res.json({ success: true, message: 'Đã rời phòng đấu giá' });
  } catch (error) {
    console.error('Lỗi leaveRoom:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi rời phòng' });
  }
}

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  joinRoom,
  leaveRoom,
};

