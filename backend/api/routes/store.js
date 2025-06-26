const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const requireAuth = require('../middleware/requireAuth');

router.get('/', requireAuth, storeController.getStoreInfo);
router.patch('/tracking', requireAuth, storeController.toggleTracking);

module.exports = router;
