const express = require('express');
const router = express.Router();

const { saveSession } = require('../controllers/sessionsController');

router.post('/', saveSession);

module.exports = router;
