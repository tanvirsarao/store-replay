const { db } = require('../lib/db');

exports.getInsights = async (req, res) => {
  const { storeId } = req.params;

  const { rows: sessions } = await db.query(
    `
    SELECT
      session_id,
      SUM(session_time)                           AS session_time,
      SUM(event_count)                            AS event_count,
      SUM(keypresses)                             AS keypresses,
      MIN(first_click_ms)                         AS first_click_ms,
      (ARRAY_AGG(last_element_id ORDER BY created_at DESC))[1] AS last_element_id,
      MAX(created_at)                             AS last_seen
    FROM sessions
    WHERE store_id = $1
    GROUP BY session_id
    `,
    [storeId]
  );

  const totalSessions   = sessions.length || 1;
  const sum             = (key) => sessions.reduce((s, r) => s + Number(r[key] || 0), 0);

  const avgSessionTime  = sum('session_time')   / totalSessions;
  const avgEventsPerMin = (sum('event_count') / (sum('session_time') / 60000 || 1));
  const avgKeypresses   = sum('keypresses')     / totalSessions;
  const avgFirstClick   = sum('first_click_ms') / totalSessions;

  const freq = {};
  sessions.forEach(r => {
    if (r.last_element_id !== null) {
      freq[r.last_element_id] = (freq[r.last_element_id] || 0) + 1;
    }
  });
  const [mostDropOffElement] =
    Object.entries(freq).sort((a, b) => b[1] - a[1])[0] || [null];

  const last10 = sessions
    .sort((a, b) => b.last_seen - a.last_seen)
    .slice(0, 10)
    .map(r => ({
      sessionId: r.session_id,
      time:      Number(r.session_time),
      clicks:    Number(r.event_count),
      aiSummary: null
    }));

  res.json({
    totalSessions,
    avgSessionTime,
    avgEventsPerMin,
    avgKeypresses,
    avgFirstClick,
    mostDropOffElement,
    last10Sessions: last10,
  });
};
