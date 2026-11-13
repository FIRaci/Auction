const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = require('./middlewares/auth');
const prisma = require('./config/prisma');
const PresenceService = require('./services/presenceService');
const auctionEngine = require('./services/auctionEngine');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const itemRoutes = require('./routes/items');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// Cấu hình CORS
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(',');

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (ví dụ mobile app hoặc curl) hoặc trong danh sách
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev mode thân thiện
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    demoMode: auctionEngine.config.demoMode,
  });
});

// Phục vụ Frontend build tĩnh (Production / Render Blueprint)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res, next) => {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/socket.io')
    ) {
      return res.sendFile(frontendIndexPath);
    }
    return next();
  });
}

// Thiết lập Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

auctionEngine.setIO(io);

// Middleware xác thực danh tính Socket.IO
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, fullName: true, role: true, balance: true },
      });
      if (user) {
        socket.user = user;
      }
    } catch (err) {
      console.warn('[Socket Auth] Token không hợp lệ, tiếp tục dưới dạng khách');
    }
  }
  next();
});

// Lắng nghe kết nối WebSocket
io.on('connection', (socket) => {
  console.log(`[Socket] Kết nối mới: ${socket.id} (User: ${socket.user?.fullName || 'Khách'})`);

  /**
   * Tham gia phòng đấu giá
   * Ràng buộc: Mỗi người chỉ được ở 1 phòng tại 1 thời điểm!
   */
  socket.on('join_room', async ({ roomId }, callback) => {
    try {
      const parsedRoomId = parseInt(roomId, 10);
      if (isNaN(parsedRoomId)) {
        if (callback) callback({ success: false, message: 'Mã phòng không hợp lệ' });
        return;
      }

      // Nếu user đã đăng nhập, thực hiện kiểm soát ràng buộc 1 phòng
      if (socket.user) {
        const presence = await PresenceService.joinRoom(socket.user.id, parsedRoomId, socket.id);

        if (presence.switchedFrom && presence.switchedFrom !== parsedRoomId) {
          // Rời socket room cũ
          socket.leave(`room_${presence.switchedFrom}`);
          // Thông báo cho phòng cũ cập nhật danh sách thành viên
          const oldMembers = await PresenceService.getRoomMembers(presence.switchedFrom);
          io.to(`room_${presence.switchedFrom}`).emit('room_members_updated', oldMembers);

          socket.emit('room_switched_notice', {
            message: `Bạn đã được chuyển từ phòng #${presence.switchedFrom} sang phòng #${parsedRoomId}. (Quy định: Mỗi tài khoản chỉ tham gia 1 phòng tại 1 thời điểm)`,
            previousRoomId: presence.switchedFrom,
          });
        }
      }

      socket.join(`room_${parsedRoomId}`);

      // Nạp thông tin phòng và đồng bộ Auction Engine
      const initData = await auctionEngine.initRoom(parsedRoomId);
      const members = await PresenceService.getRoomMembers(parsedRoomId);

      // Phát cho toàn phòng danh sách thành viên mới
      io.to(`room_${parsedRoomId}`).emit('room_members_updated', members);

      if (callback) {
        callback({
          success: true,
          room: initData?.room,
          state: initData?.state,
          members,
        });
      }
    } catch (error) {
      console.error('[Socket join_room error]:', error);
      if (callback) callback({ success: false, message: error.message });
    }
  });

  /**
   * Rời phòng đấu giá
   */
  socket.on('leave_room', async ({ roomId }, callback) => {
    try {
      const parsedRoomId = parseInt(roomId, 10);
      socket.leave(`room_${parsedRoomId}`);

      if (socket.user) {
        await PresenceService.leaveRoom(socket.user.id, parsedRoomId);
        const members = await PresenceService.getRoomMembers(parsedRoomId);
        io.to(`room_${parsedRoomId}`).emit('room_members_updated', members);
      }

      if (callback) callback({ success: true });
    } catch (error) {
      console.error('[Socket leave_room error]:', error);
      if (callback) callback({ success: false, message: error.message });
    }
  });

  /**
   * Đặt giá đấu giá (Place Bid)
   */
  socket.on('place_bid', async ({ roomId, amount }, callback) => {
    try {
      if (!socket.user) {
        if (callback) callback({ success: false, message: 'Bạn cần đăng nhập để đặt giá' });
        return;
      }

      const parsedRoomId = parseInt(roomId, 10);
      const bidAmount = parseFloat(amount);

      const result = await auctionEngine.placeBid(parsedRoomId, socket.user.id, bidAmount);
      if (callback) callback(result);
    } catch (error) {
      console.error('[Socket place_bid error]:', error);
      if (callback) callback({ success: false, message: error.message });
    }
  });

  /**
   * Chốt giá vật phẩm theo Giá chốt (Buy Now)
   */
  socket.on('buy_now', async ({ roomId }, callback) => {
    try {
      if (!socket.user) {
        if (callback) callback({ success: false, message: 'Bạn cần đăng nhập để chốt giá' });
        return;
      }

      const parsedRoomId = parseInt(roomId, 10);
      const result = await auctionEngine.buyNow(parsedRoomId, socket.user.id);
      if (callback) callback(result);
    } catch (error) {
      console.error('[Socket buy_now error]:', error);
      if (callback) callback({ success: false, message: error.message });
    }
  });

  /**
   * Ngắt kết nối
   */
  socket.on('disconnect', async () => {
    const cleaned = await PresenceService.handleSocketDisconnect(socket.id);
    if (cleaned && cleaned.roomId) {
      const members = await PresenceService.getRoomMembers(cleaned.roomId);
      io.to(`room_${cleaned.roomId}`).emit('room_members_updated', members);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏛️ RoyalAuction Server is running on port ${PORT}`);
  console.log(`⚡ WebSocket Server ready with FIFO Queue & 3-Call Engine`);
  console.log(`🌐 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

module.exports = { app, server };

