const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const insightsController = require('../controllers/insightsController');

router.get('/:storeId', authMiddleware, insightsController.getInsights);

module.exports = router;