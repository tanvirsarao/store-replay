/* --- api/controllers/replayController.js --- */
const { db } = require('../lib/db');
const { getS3Object } = require('../lib/s3');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const BUCKET = 'storereplay-sessions';

/**
 * GET /api/session/:sessionId/replay
 */
exports.getReplay = async (req, res) => {
  const { sessionId } = req.params;

  /* 1️⃣ load ALL rows for this session (handles multi-batch sessions) */
  let rows;
  try {
    const { rows: r } = await db.query(
      'SELECT * FROM sessions WHERE session_id = $1',
      [sessionId]
    );
    if (!r.length) return res.status(404).json({ error: 'Session not found' });
    rows = r;
  } catch (err) {
    console.error('❌ DB query error:', err);
    return res.status(500).json({ error: 'Database query failed' });
  }

  /* 2️⃣ merge events from each batch */
  let events = [];
  for (const row of rows) {
    try {
      const json = await getS3Object(`${row.session_id}.json`);
      events = events.concat(JSON.parse(json));
    } catch (err) {
      console.error('⚠️  Failed S3 fetch for batch:', row.session_id, err.message);
    }
  }
  if (!events.length) return res.status(500).json({ error: 'No events in S3' });

  /* 3️⃣ aggregate metrics */
  let cumulative    = 0;
  let firstClickMs  = null;
  let totalKeys     = 0;

  events.forEach((ev) => {
    const delay = ev.delay || 0;
    cumulative += delay;

    /* detect click – rrweb incremental (type 3) & mouseInteraction (source 2) & mousedown (data.type === 1) */
    const isClick =
      ev.type === 3 &&
      ev.data?.source === 2 &&
      ev.data?.type === 1;

    if (firstClickMs === null && isClick) firstClickMs = cumulative;

    /* detect keypress – rrweb inputInteraction (source 5) */
    if (ev.type === 3 && ev.data?.source === 5) totalKeys += 1;
  });

  const eventCount  = events.length;
  const sessionTime = cumulative;

  /* 4️⃣ AI summary (~50 words) – only if not already stored */
  let summary = rows[0].ai_summary;
  if (!summary) {
    try {
      const resp = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Summarise this Shopify user session in ~50 words (no code). Include any out of the ordinary behaviors. Use natural language in your response. For instance, you can say "Add to Cart" when referring to an element, but not "Add to Cart"' },
          { role: 'user',   content: JSON.stringify(events.slice(0, 120)).slice(0, 3500) }
        ],
        temperature: 0.4,
        max_tokens : 90
      });
      summary = resp.choices[0].message.content
        .replace(/\\"/g, '"')          // clean escaped quotes
        .replace(/\\n/g, ' ')          // clean newlines
        .trim();

      await db.query(
        'UPDATE sessions SET ai_summary = $1 WHERE session_id = $2',
        [summary, sessionId]
      );
    } catch (err) {
      console.error('⚠️  AI summary failed:', err.message);
      summary = null;
    }
  }

  /* 5️⃣ respond */
  return res.json({
    metadata: {
      session_id       : sessionId,
      store_id         : rows[0].store_id,
      timestamp        : rows[0].timestamp,
      event_count      : eventCount,
      session_time     : sessionTime,
      total_keypresses : totalKeys,
      first_click_ms   : firstClickMs,
      ai_summary       : summary,
      s3_url           : rows[0].s3_url
    },
    events
  });
};
