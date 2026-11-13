const prisma = require('../config/prisma');

// userId -> { roomId, socketId, joinedAt }
const userPresenceMap = new Map();

class PresenceService {
  /**
   * Đảm bảo ràng buộc: Tại 1 thời điểm, mỗi user chỉ ở 1 phòng duy nhất
   */
  static async joinRoom(userId, roomId, socketId = null) {
    try {
      const existing = await prisma.roomParticipant.findUnique({
        where: { userId },
      });

      const previousRoomId = existing ? existing.roomId : null;

      await prisma.roomParticipant.upsert({
        where: { userId },
        update: {
          roomId,
          socketId: socketId || existing?.socketId || null,
          joinedAt: new Date(),
        },
        create: {
          userId,
          roomId,
          socketId: socketId || null,
          joinedAt: new Date(),
        },
      });

      userPresenceMap.set(userId, { roomId, socketId, joinedAt: new Date() });

      return {
        success: true,
        switchedFrom: previousRoomId && previousRoomId !== roomId ? previousRoomId : null,
        currentRoomId: roomId,
      };
    } catch (err) {
      console.error('[PresenceService.joinRoom error]:', err.message);
      return {
        success: true,
        switchedFrom: null,
        currentRoomId: roomId,
      };
    }
  }

  /**
   * Rời phòng đấu giá
   */
  static async leaveRoom(userId, roomId = null) {
    try {
      const condition = roomId ? { userId, roomId } : { userId };
      await prisma.roomParticipant.deleteMany({
        where: condition,
      });
      userPresenceMap.delete(userId);
      return { success: true };
    } catch (error) {
      console.error('Lỗi khi rời phòng:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lấy phòng hiện tại của người dùng
   */
  static async getUserCurrentRoom(userId) {
    return await prisma.roomParticipant.findUnique({
      where: { userId },
      include: {
        room: {
          select: { id: true, title: true, code: true, status: true },
        },
      },
    });
  }

  /**
   * Lấy danh sách thành viên đang có mặt trong 1 phòng
   */
  static async getRoomMembers(roomId) {
    const participants = await prisma.roomParticipant.findMany({
      where: { roomId },
      include: {
        user: {
          select: { id: true, fullName: true, role: true, email: true },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return participants.map((p) => ({
      userId: p.user.id,
      fullName: p.user.fullName,
      role: p.user.role,
      joinedAt: p.joinedAt,
    }));
  }

  /**
   * Dọn dẹp kết nối khi socket ngắt
   */
  static async handleSocketDisconnect(socketId) {
    for (const [userId, data] of userPresenceMap.entries()) {
      if (data.socketId === socketId) {
        userPresenceMap.delete(userId);
        await prisma.roomParticipant.deleteMany({
          where: { userId },
        });
        return { userId, roomId: data.roomId };
      }
    }
    return null;
  }
}

module.exports = PresenceService;

