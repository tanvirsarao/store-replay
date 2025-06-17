const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const BUCKET = 'storereplay-sessions';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

app.post('/api/sessions', (req, res) => {
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

  s3.upload(params, (err, data) => {
    if (err) {
      console.error('❌ S3 Upload Error:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }

    console.log(`✅ Session stored in S3: ${data.Location}`);
    return res.status(200).json({ message: 'Session saved to S3' });
  });
});

app.listen(PORT, () => {
  console.log(`🟢 StoreReplay API listening on port ${PORT}`);
});
