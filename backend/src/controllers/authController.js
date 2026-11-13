const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET } = require('../middlewares/auth');

async function register(req, res) {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email, mật khẩu và họ tên' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng trên hệ thống' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: phone || null,
        role: 'MEMBER',
        balance: 500000000, // Tặng 500 triệu VNĐ mặc định để trải nghiệm đấu giá
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        balance: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: { user, token },
    });
  } catch (error) {
    console.error('Lỗi register:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng ký' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      balance: user.balance,
      createdAt: user.createdAt,
    };

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { user: safeUser, token },
    });
  } catch (error) {
    console.error('Lỗi login:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng nhập' });
  }
}

async function getMe(req, res) {
  try {
    const activeParticipant = await prisma.roomParticipant.findUnique({
      where: { userId: req.user.id },
      include: {
        room: {
          select: { id: true, title: true, code: true, status: true },
        },
      },
    });

    return res.json({
      success: true,
      data: {
        user: req.user,
        currentRoom: activeParticipant ? activeParticipant.room : null,
      },
    });
  } catch (error) {
    console.error('Lỗi getMe:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy thông tin người dùng' });
  }
}

module.exports = {
  register,
  login,
  getMe,
};

