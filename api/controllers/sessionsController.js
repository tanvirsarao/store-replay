const { uploadToS3 } = require('../lib/s3');
const { db } = require('../lib/db');

const BUCKET = 'storereplay-sessions';

exports.saveSession = (req, res) => {
  const { sessionId, timestamp, events } = req.body;

  console.log('✅ Session received:', {
    sessionId,
    timestamp,
    eventCount: events.length,
  });

  const params = {
    Bucket: BUCKET,
    Key: `${sessionId}.json`,
    Body: JSON.stringify(events),
    ContentType: 'application/json',
  };

  uploadToS3(params, async (err, data) => {
    if (err) {
      console.error('❌ S3 Upload Error:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }

    console.log(`✅ Session stored in S3: ${data.Location}`);

    try {
      await db.query(
        'INSERT INTO sessions (session_id, timestamp, event_count, s3_url) VALUES ($1, $2, $3, $4)',
        [sessionId, timestamp, events.length, data.Location]
      );
      console.log('✅ Metadata stored in PostgreSQL');
      return res.status(200).json({ message: 'Session saved to S3 and metadata stored' });
    } catch (err) {
      console.error('❌ DB Insert Error:', err);
      return res.status(500).json({ error: 'Database insert failed' });
    }
  });
};
