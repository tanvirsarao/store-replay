const express = require('express');
const router = express.Router();

const { analyzeSession } = require('../controllers/analysisController');

router.post('/:sessionId', analyzeSession);

module.exports = router;
