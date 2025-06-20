const { db } = require('../lib/db');

// GET /api/store
exports.getStoreInfo = async (req, res) => {
  const { store_id } = req.user;           // came from middleware
  const { rows } = await db.query(
    'SELECT tracking_enabled FROM stores WHERE store_id = $1',
    [store_id]
  );
  res.json({
    storeId: store_id,
    trackingEnabled: rows[0]?.tracking_enabled ?? false,
  });
};

// PATCH /api/store/tracking  { enabled: true/false }
exports.toggleTracking = async (req, res) => {
  const { enabled } = req.body;
  const { store_id } = req.user;
  await db.query(
    'UPDATE stores SET tracking_enabled = $1 WHERE store_id = $2',
    [!!enabled, store_id]
  );
  res.json({ trackingEnabled: !!enabled });
};
