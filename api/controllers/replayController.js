const { db } = require('../lib/db');
const { getS3Object } = require('../lib/s3');

exports.getReplay = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const { rows } = await db.query('SELECT * FROM sessions WHERE session_id = $1', [sessionId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = rows[0];

    // Fetch session replay JSON from S3
    const s3Key = `${session.session_id}.json`;
    const replayData = await getS3Object(s3Key);

    return res.status(200).json({
      metadata: {
        sessionId: session.session_id,
        timestamp: session.timestamp,
        storeId: session.store_id,
        duration: session.session_time,
        eventCount: session.event_count,
        s3_url: session.s3_url,
      },
      events: JSON.parse(replayData),
    });
  } catch (err) {
    console.error('❌ Replay fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
