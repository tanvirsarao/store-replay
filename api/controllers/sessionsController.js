const { uploadToS3 } = require('../lib/s3');
const { db } = require('../lib/db');

const BUCKET = 'storereplay-sessions';

exports.saveSession = (req, res) => {
  const {
    sessionId,
    storeId,
    timestamp,
    events = [],
    eventCount,
    sessionTime,
    keypresses,
    firstClickMs,
    lastElementId,
  } = req.body;

  console.log('✅ Session received:', {
    sessionId,
    storeId,
    timestamp,
    eventCount: events.length,
  });

  const computedEventCount  = eventCount   ?? events.length;
  const computedSessionTime = sessionTime  ?? (
    events.length ? events.at(-1).timestamp - events[0].timestamp : 0
  );
  const computedKeypresses  = keypresses   ?? events.filter(e => e.data?.source === 5).length;

  const firstClick = events.find(
    e => e.data?.source === 2 && e.data?.type === 0
  );
  const computedFirstClickMs = firstClickMs ?? (
    firstClick ? firstClick.timestamp - events[0].timestamp : null
  );

  const lastInteractive = events
    .filter(e => e.data?.id !== undefined)
    .at(-1);
  const computedLastElementId = lastElementId ?? (lastInteractive?.data?.id ?? null);

  const s3Params = {
    Bucket: BUCKET,
    Key: `${sessionId}.json`,
    Body: JSON.stringify(events),
    ContentType: 'application/json',
  };

  uploadToS3(s3Params, async (err, data) => {
    if (err) {
      console.error('❌ S3 Upload Error:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }

    console.log(`✅ Session stored in S3: ${data.Location}`);

    try {
      await db.query(
        `INSERT INTO sessions (
          session_id,
          store_id,
          timestamp,
          event_count,
          session_time,
          keypresses,
          first_click_ms,
          last_element_id,
          s3_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          sessionId,
          storeId,
          timestamp,
          computedEventCount,
          computedSessionTime,
          computedKeypresses,
          computedFirstClickMs,
          computedLastElementId,
          data.Location
        ]
      );

      console.log('✅ Session + stats stored in PostgreSQL');
      res.status(200).json({ message: 'Session saved and stats recorded' });
    } catch (dbErr) {
      console.error('❌ DB Insert Error:', dbErr);
      res.status(500).json({ error: 'Database insert failed' });
    }
  });
};
