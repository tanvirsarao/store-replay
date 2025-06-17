const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

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

  // For now, we’ll just return success
  res.status(200).json({ message: 'Session saved' });
});

app.listen(PORT, () => {
  console.log(`🟢 StoreReplay API listening on port ${PORT}`);
});
