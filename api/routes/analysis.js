// routes/analysis.js
const express = require('express');
const router = express.Router();

const {
  getSummaryAnalysis
} = require('../controllers/analysisController');

// Analyze recent activity (deduplicated, capped at 100 events total) – no DB write
router.get('/:storeId', getSummaryAnalysis);

module.exports = router;
