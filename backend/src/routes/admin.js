const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT, requireAdmin } = require('../middlewares/auth');

// Toàn bộ route admin yêu cầu xác thực và quyền ADMIN
router.use(authenticateJWT, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/rooms', adminController.getAllRooms);
router.patch('/rooms/:id', adminController.updateRoom);
router.post('/items/queue', adminController.updateItemQueue);
router.post('/settings/demo-mode', adminController.toggleDemoMode);
router.post('/rooms/:id/force-hammer', adminController.forceHammer);
router.post('/rooms/:id/skip-item', adminController.skipItem);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

module.exports = router;

