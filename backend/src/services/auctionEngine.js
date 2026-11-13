const prisma = require('../config/prisma');

class AuctionEngine {
  constructor() {
    this.io = null;
    // Map: roomId -> RoomState
    this.roomStates = new Map();

    // Default configuration (3 minutes idle, 30s calls)
    this.config = {
      idleTimeoutSeconds: 180, // 3 phút
      callIntervalSeconds: 30, // 30 giây
      demoMode: false,         // Nếu true: 10s idle, 5s call
      demoIdleSeconds: 10,
      demoCallSeconds: 5,
    };
  }

  setIO(io) {
    this.io = io;
  }

  getIdleMs() {
    return (this.config.demoMode ? this.config.demoIdleSeconds : this.config.idleTimeoutSeconds) * 1000;
  }

  getCallMs() {
    return (this.config.demoMode ? this.config.demoCallSeconds : this.config.callIntervalSeconds) * 1000;
  }

  setDemoMode(enabled) {
    this.config.demoMode = Boolean(enabled);
    console.log(`[AuctionEngine] Demo mode set to: ${this.config.demoMode}`);
    return this.config.demoMode;
  }

  getRoomState(roomId) {
    if (!this.roomStates.has(roomId)) {
      this.roomStates.set(roomId, {
        roomId,
        activeItemId: null,
        idleTimer: null,
        callStage: 0, // 0: None, 1: Lần 1, 2: Lần 2, 3: Lần 3
        callTimer: null,
        callDeadline: null,
        highestBid: null,
      });
    }
    return this.roomStates.get(roomId);
  }

  clearTimers(state) {
    if (state.idleTimer) {
      clearTimeout(state.idleTimer);
      state.idleTimer = null;
    }
    if (state.callTimer) {
      clearTimeout(state.callTimer);
      state.callTimer = null;
    }
    state.callStage = 0;
    state.callDeadline = null;
  }

  /**
   * Khởi động phòng hoặc nạp trạng thái hiện tại
   */
  async initRoom(roomId) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        items: {
          orderBy: { queueOrder: 'asc' },
          include: {
            seller: { select: { id: true, fullName: true } },
            winner: { select: { id: true, fullName: true } },
            bids: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { bidder: { select: { id: true, fullName: true } } },
            },
          },
        },
      },
    });

    if (!room) return null;

    const state = this.getRoomState(roomId);

    // Tìm item đang BIDDING hoặc item đầu tiên WAITING
    let activeItem = room.items.find((i) => i.status === 'BIDDING');

    if (!activeItem && room.status === 'LIVE') {
      const nextWaiting = room.items.find((i) => i.status === 'WAITING');
      if (nextWaiting) {
        activeItem = await this.activateItem(roomId, nextWaiting.id);
      }
    }

    if (activeItem) {
      state.activeItemId = activeItem.id;
      const latestBid = activeItem.bids && activeItem.bids[0];
      state.highestBid = latestBid
        ? { amount: latestBid.amount, bidder: latestBid.bidder }
        : { amount: activeItem.currentPrice, bidder: null };

      // Nếu đang BIDDING và chưa có timer, kích hoạt timer
      if (!state.idleTimer && !state.callTimer && room.status === 'LIVE') {
        this.startIdleTimer(roomId);
      }
    }

    return { room, state };
  }

  /**
   * Kích hoạt một lô vật phẩm lên sàn đấu giá
   */
  async activateItem(roomId, itemId) {
    const state = this.getRoomState(roomId);
    this.clearTimers(state);

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { status: 'BIDDING' },
      include: {
        seller: { select: { id: true, fullName: true } },
      },
    });

    await prisma.room.update({
      where: { id: roomId },
      data: { currentItemId: itemId },
    });

    state.activeItemId = updatedItem.id;
    state.highestBid = { amount: updatedItem.currentPrice, bidder: null };

    // Ghi log sự kiện
    await prisma.auctionEventLog.create({
      data: {
        roomId,
        itemId: updatedItem.id,
        eventType: 'NEXT_ITEM',
        message: `Lô "${updatedItem.title}" chính thức lên sàn với giá khởi điểm ${updatedItem.startingPrice.toLocaleString('vi-VN')} VNĐ.`,
      },
    });

    // Bắt đầu bộ đếm 3 phút nhàn rỗi
    this.startIdleTimer(roomId);

    // Phát sóng sự kiện cho toàn bộ người trong phòng
    if (this.io) {
      this.io.to(`room_${roomId}`).emit('item_activated', {
        item: updatedItem,
        idleTimeoutSeconds: this.config.demoMode ? this.config.demoIdleSeconds : this.config.idleTimeoutSeconds,
      });
    }

    return updatedItem;
  }

  /**
   * Bắt đầu bộ đếm thời gian 3 phút (hoặc demo) sau khi lên sàn hoặc sau khi có lượt đặt giá
   */
  startIdleTimer(roomId) {
    const state = this.getRoomState(roomId);
    this.clearTimers(state);

    const idleMs = this.getIdleMs();
    console.log(`[AuctionEngine] Phòng ${roomId}: Bắt đầu đếm nhàn rỗi ${idleMs / 1000}s`);

    state.idleTimer = setTimeout(() => {
      this.triggerCallSequence(roomId, 1);
    }, idleMs);
  }

  /**
   * Kích hoạt chuỗi 3 lần thông báo (3-Call Countdown)
   */
  async triggerCallSequence(roomId, stage) {
    const state = this.getRoomState(roomId);
    state.idleTimer = null;
    state.callStage = stage;

    const callMs = this.getCallMs();
    const deadline = new Date(Date.now() + callMs);
    state.callDeadline = deadline;

    const currentItem = await prisma.item.findUnique({
      where: { id: state.activeItemId },
    });

    if (!currentItem || currentItem.status !== 'BIDDING') {
      this.clearTimers(state);
      return;
    }

    const priceText = currentItem.currentPrice.toLocaleString('vi-VN') + ' VNĐ';
    const leaderName = state.highestBid?.bidder?.fullName || 'Giá khởi điểm';
    const message = `Đếm lần thứ ${stage}: Mức giá ${priceText} thuộc về ${leaderName}!`;

    console.log(`[AuctionEngine] Phòng ${roomId}: ${message}`);

    // Ghi log
    await prisma.auctionEventLog.create({
      data: {
        roomId,
        itemId: currentItem.id,
        eventType: `CALL_${stage}`,
        message,
      },
    });

    // Phát sóng cho toàn phòng
    if (this.io) {
      this.io.to(`room_${roomId}`).emit('announcement_call', {
        stage,
        durationSeconds: callMs / 1000,
        deadline,
        currentPrice: currentItem.currentPrice,
        leader: state.highestBid?.bidder,
        message,
      });
    }

    // Lên lịch cho bước tiếp theo
    state.callTimer = setTimeout(async () => {
      if (stage < 3) {
        // Chuyển sang lần tiếp theo (Lần 2 hoặc Lần 3)
        await this.triggerCallSequence(roomId, stage + 1);
      } else {
        // Đã hoàn tất 3 lần gọi -> Gõ búa (Hammer Down)!
        await this.executeHammerDown(roomId);
      }
    }, callMs);
  }

  /**
   * Gõ búa chốt kết quả (Hammer Down)
   */
  async executeHammerDown(roomId) {
    const state = this.getRoomState(roomId);
    this.clearTimers(state);

    const item = await prisma.item.findUnique({
      where: { id: state.activeItemId },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: { bidder: { select: { id: true, fullName: true, email: true } } },
        },
      },
    });

    if (!item || item.status !== 'BIDDING') return;

    const winningBid = item.bids[0];

    if (winningBid) {
      // Có người đặt giá -> Trúng đấu giá (SOLD)
      const updatedItem = await prisma.item.update({
        where: { id: item.id },
        data: {
          status: 'SOLD',
          winnerId: winningBid.bidderId,
          soldPrice: winningBid.amount,
          soldType: 'AUCTION',
          soldAt: new Date(),
        },
        include: { winner: { select: { id: true, fullName: true } } },
      });

      const message = `Gõ búa! Chúc mừng ${winningBid.bidder.fullName} đã trúng đấu giá lô "${item.title}" với giá ${winningBid.amount.toLocaleString('vi-VN')} VNĐ!`;

      await prisma.auctionEventLog.create({
        data: {
          roomId,
          itemId: item.id,
          eventType: 'HAMMER_SOLD',
          message,
        },
      });

      if (this.io) {
        this.io.to(`room_${roomId}`).emit('hammer_down', {
          result: 'SOLD',
          item: updatedItem,
          winner: winningBid.bidder,
          soldPrice: winningBid.amount,
          message,
        });
      }
    } else {
      // Không có người đặt giá -> Không bán được (UNSOLD)
      const updatedItem = await prisma.item.update({
        where: { id: item.id },
        data: {
          status: 'UNSOLD',
          soldAt: new Date(),
        },
      });

      const message = `Lô "${item.title}" kết thúc phiên đấu giá không có người trả giá (Chưa bán được).`;

      await prisma.auctionEventLog.create({
        data: {
          roomId,
          itemId: item.id,
          eventType: 'UNSOLD',
          message,
        },
      });

      if (this.io) {
        this.io.to(`room_${roomId}`).emit('hammer_down', {
          result: 'UNSOLD',
          item: updatedItem,
          message,
        });
      }
    }

    // Tự động chuyển sang lô tiếp theo trong hàng đợi FIFO sau 4 giây
    setTimeout(async () => {
      await this.advanceToNextItem(roomId);
    }, 4000);
  }

  /**
   * Đặt giá đấu giá (Place Bid)
   * Kiểm tra điều kiện: Giá mới >= Giá hiện tại + 10.000 VNĐ
   */
  async placeBid(roomId, userId, amount) {
    const state = this.getRoomState(roomId);
    const item = await prisma.item.findUnique({
      where: { id: state.activeItemId },
      include: {
        seller: { select: { id: true, fullName: true } },
      },
    });

    if (!item) {
      return { success: false, message: 'Không tìm thấy vật phẩm đang đấu giá' };
    }

    if (item.status !== 'BIDDING') {
      return { success: false, message: 'Vật phẩm này hiện không trong phiên đặt giá' };
    }

    if (item.sellerId === userId) {
      return { success: false, message: 'Người bán không được phép tự đấu giá vật phẩm của chính mình' };
    }

    const minIncrement = item.minIncrement || 10000;
    const requiredMinPrice = item.currentPrice + minIncrement;

    if (amount < requiredMinPrice) {
      return {
        success: false,
        message: `Lệnh đặt giá không hợp lệ. Giá đặt phải lớn hơn giá hiện tại ít nhất ${minIncrement.toLocaleString('vi-VN')} VNĐ (Tối thiểu: ${requiredMinPrice.toLocaleString('vi-VN')} VNĐ)`,
      };
    }

    // Nếu người này đã là người dẫn đầu cao nhất
    if (state.highestBid?.bidder?.id === userId) {
      return {
        success: false,
        message: 'Bạn hiện đã là người đặt giá cao nhất, không cần đặt thêm lệnh cho chính mình',
      };
    }

    // Tạo bản ghi Bid
    const bid = await prisma.bid.create({
      data: {
        itemId: item.id,
        bidderId: userId,
        amount,
      },
      include: {
        bidder: { select: { id: true, fullName: true, role: true } },
      },
    });

    // Cập nhật giá hiện tại của Item
    const updatedItem = await prisma.item.update({
      where: { id: item.id },
      data: { currentPrice: amount },
    });

    // Cập nhật state bộ nhớ
    state.highestBid = { amount, bidder: bid.bidder };

    // Hủy bỏ mọi thông báo đếm lần 1, 2, 3 nếu đang chạy
    this.clearTimers(state);

    const message = `${bid.bidder.fullName} đã nâng giá lên ${amount.toLocaleString('vi-VN')} VNĐ (+${(amount - item.currentPrice).toLocaleString('vi-VN')} VNĐ)`;

    await prisma.auctionEventLog.create({
      data: {
        roomId,
        itemId: item.id,
        eventType: 'BID',
        message,
      },
    });

    // Bắt đầu lại bộ đếm nhàn rỗi 3 phút
    this.startIdleTimer(roomId);

    // Phát sóng sự kiện đặt giá mới cho toàn bộ người trong phòng
    if (this.io) {
      this.io.to(`room_${roomId}`).emit('new_bid', {
        item: updatedItem,
        bid,
        message,
        idleTimeoutSeconds: this.config.demoMode ? this.config.demoIdleSeconds : this.config.idleTimeoutSeconds,
      });
    }

    return { success: true, bid, item: updatedItem };
  }

  /**
   * Chốt giá ngay theo Giá chốt (Buy Now)
   */
  async buyNow(roomId, userId) {
    const state = this.getRoomState(roomId);
    const item = await prisma.item.findUnique({
      where: { id: state.activeItemId },
    });

    if (!item || item.status !== 'BIDDING') {
      return { success: false, message: 'Vật phẩm không khả dụng để chốt giá' };
    }

    if (!item.buyNowPrice || item.buyNowPrice <= 0) {
      return { success: false, message: 'Vật phẩm này không áp dụng Giá chốt' };
    }

    if (item.sellerId === userId) {
      return { success: false, message: 'Người bán không thể tự chốt giá vật phẩm của chính mình' };
    }

    const buyer = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true },
    });

    // Hủy toàn bộ timer
    this.clearTimers(state);

    // Chốt bán ngay lập tức
    const updatedItem = await prisma.item.update({
      where: { id: item.id },
      data: {
        status: 'SOLD',
        winnerId: buyer.id,
        soldPrice: item.buyNowPrice,
        soldType: 'BUY_NOW',
        soldAt: new Date(),
        currentPrice: item.buyNowPrice,
      },
      include: {
        winner: { select: { id: true, fullName: true } },
      },
    });

    const message = `Xác nhận Chốt Giá! ${buyer.fullName} đã chốt sở hữu lô "${item.title}" ở mức Giá chốt ${item.buyNowPrice.toLocaleString('vi-VN')} VNĐ.`;

    await prisma.auctionEventLog.create({
      data: {
        roomId,
        itemId: item.id,
        eventType: 'BUY_NOW',
        message,
      },
    });

    if (this.io) {
      this.io.to(`room_${roomId}`).emit('item_bought_now', {
        item: updatedItem,
        buyer,
        message,
      });
    }

    // Tự động chuyển sang lô tiếp theo trong hàng đợi FIFO sau 4 giây
    setTimeout(async () => {
      await this.advanceToNextItem(roomId);
    }, 4000);

    return { success: true, item: updatedItem, buyer };
  }

  /**
   * Chuyển sang lô tiếp theo trong hàng đợi FIFO
   */
  async advanceToNextItem(roomId) {
    const state = this.getRoomState(roomId);
    this.clearTimers(state);

    // Tìm item tiếp theo có status WAITING theo thứ tự queueOrder
    const nextItem = await prisma.item.findFirst({
      where: {
        roomId,
        status: 'WAITING',
      },
      orderBy: { queueOrder: 'asc' },
    });

    if (nextItem) {
      console.log(`[AuctionEngine] Phòng ${roomId}: Đưa lô tiếp theo lên sàn (${nextItem.title})`);
      await this.activateItem(roomId, nextItem.id);
    } else {
      console.log(`[AuctionEngine] Phòng ${roomId}: Đã hết vật phẩm trong hàng đợi. Phiên kết thúc.`);
      state.activeItemId = null;
      state.highestBid = null;

      await prisma.room.update({
        where: { id: roomId },
        data: {
          status: 'ENDED',
          currentItemId: null,
        },
      });

      const message = 'Phiên đấu giá đã hoàn tất toàn bộ các lô trong hàng đợi. Cảm ơn quý khách đã tham dự!';

      await prisma.auctionEventLog.create({
        data: {
          roomId,
          eventType: 'ROOM_ENDED',
          message,
        },
      });

      if (this.io) {
        this.io.to(`room_${roomId}`).emit('room_ended', { message });
      }
    }
  }

  /**
   * Quyền can thiệp của Quản trị viên (Admin)
   */
  async adminForceHammer(roomId) {
    await this.executeHammerDown(roomId);
    return { success: true, message: 'Admin đã thực hiện lệnh gõ búa chốt giá sớm' };
  }

  async adminSkipItem(roomId) {
    const state = this.getRoomState(roomId);
    if (!state.activeItemId) {
      return { success: false, message: 'Không có vật phẩm nào đang đấu giá' };
    }

    this.clearTimers(state);
    await prisma.item.update({
      where: { id: state.activeItemId },
      data: { status: 'UNSOLD', soldAt: new Date() },
    });

    await this.advanceToNextItem(roomId);
    return { success: true, message: 'Đã bỏ qua lô hiện tại và chuyển sang lô tiếp theo' };
  }
}

// Singleton instance
const auctionEngineInstance = new AuctionEngine();
module.exports = auctionEngineInstance;

