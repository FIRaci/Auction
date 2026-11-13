const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticateJWT, optionalAuth } = require('../middlewares/auth');

router.get('/', optionalAuth, roomController.getRooms);
router.get('/:id', optionalAuth, roomController.getRoomById);
router.post('/', authenticateJWT, roomController.createRoom);
router.post('/:id/join', authenticateJWT, roomController.joinRoom);
router.post('/:id/leave', authenticateJWT, roomController.leaveRoom);

module.exports = router;

