const express = require('express');
const { getHistory } = require('../controllers/historyController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();
router.use(authenticateToken);
// Route untuk mendapatkan semua data history
router.get('/', getHistory);

module.exports = router;