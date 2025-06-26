const router = require('express').Router();
const { getReplay } = require('../controllers/replayController');
const { authMiddleware } = require('../middleware/authMiddleware'); // use your Supabase one

// GET /api/session/:sessionId/replay
router.get('/:sessionId/replay', authMiddleware, getReplay);

module.exports = router;
