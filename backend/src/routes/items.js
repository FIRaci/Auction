const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authenticateJWT } = require('../middlewares/auth');

router.post('/', authenticateJWT, itemController.createItem);
router.get('/:id', itemController.getItemById);

module.exports = router;

