const express = require('express');
const router = express.Router();
const { db } = require('../lib/db');

router.get('/:storeId', async (req, res) => {
  const { storeId } = req.params;

  // fetch basic store info
  const { rows: storeRows } = await db.query(
    'select tracking_enabled from stores where store_id = $1',
    [storeId]
  );

  // simple aggregates (replace with real SQL later)
  const { rows: stats } = await db.query(
    `
    select
      avg(event_count)::numeric(10,1)  as avg_clicks,
      avg(keypresses)::numeric(10,1)   as avg_keystrokes,
      avg(session_time)::numeric(10,1) as avg_session_time,
      avg(scroll_cm)::numeric(10,1)    as avg_scroll_cm
    from session_stats
    where store_id = $1
    `,
    [storeId]
  );

  // last 10 visitors with AI insights
  const { rows: last } = await db.query(
    `select session_id               as id,
            session_time             as time,
            event_count              as clicks,
            ai_summary               as ai
       from session_stats
      where store_id = $1
   order by created_at desc
      limit 10`,
    [storeId]
  );

  res.json({
    storeId,
    trackingEnabled: storeRows[0]?.tracking_enabled ?? false,
    metrics: {
      avgSessionTime: Number(stats[0]?.avg_session_time) || 0,
      avgClicks:      Number(stats[0]?.avg_clicks)       || 0,
      avgKeystrokes:  Number(stats[0]?.avg_keystrokes)   || 0,
      avgScrollCm:    Number(stats[0]?.avg_scroll_cm)    || 0
    },
    lastVisitors: last
  });
});

module.exports = router;
