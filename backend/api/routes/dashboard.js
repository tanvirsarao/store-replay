// routes/dashboard.js
const express = require('express');
const router  = express.Router();
const { getMetrics } = require('../controllers/dashboardController');

router.get('/:storeId', getMetrics);

module.exports = router;
