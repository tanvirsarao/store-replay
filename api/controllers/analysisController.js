// controllers/analysisController.js
const { db } = require('../lib/db');
const { OpenAI } = require('openai');
const fetch = require('node-fetch');
const { s3 } = require('../lib/s3');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// exports.analyzeSession = async (req, res) => {
//   const { sessionId } = req.params;

//   try {
//     const result = await db.query(
//       'SELECT s3_url FROM sessions WHERE session_id = $1',
//       [sessionId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Session not found' });
//     }

//     const s3Url = result.rows[0].s3_url;
//     const key = s3Url.split('.com/')[1];

//     const signedUrl = s3.getSignedUrl('getObject', {
//       Bucket: 'storereplay-sessions',
//       Key: key,
//       Expires: 60,
//     });

//     const response = await fetch(signedUrl);
//     const sessionEvents = await response.json();

//     const summaryPrompt = `
// You are a UX expert analyzing user behavior on a Shopify store. You are given structured rrweb event data, where each event contains a "metadata" field with the following:

// - action: hover, click, input, scroll
// - tagName: the HTML tag name (e.g., BUTTON, INPUT)
// - className: class of the element (if any)
// - textContent: the visible text on the element
// - delay: ms since previous event

// Your job is to:
// 1. Identify rage clicks (repeated clicks on the same element).
// 2. Spot user confusion (rapid or aimless movements or interactions).
// 3. Find drop-off points (user stops interacting suddenly).
// 4. Understand user intent and path (what elements they engage with most).

// 🛒0 DO NOT reference raw coordinates or internal IDs (e.g., x/y or "id": 3).
// 📅 Instead, describe elements using their "tag", "class", or "text".

// Give a structured 150-word UX summary across multiple sessions, noting general trends and suggesting 2-3 actionable UX improvements.
// Here is the session data:

// ${JSON.stringify(sessionEvents.slice(0, 100))}
// `;

//     const aiResponse = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: [
//         { role: 'system', content: "You're an expert UX analyst for online Shopify stores." },
//         { role: 'user', content: summaryPrompt },
//       ],
//     });

//     const summary = aiResponse.choices[0].message.content;
//     return res.status(200).json({ summary });

//   } catch (err) {
//     console.error('❌ AI Analysis Error:', err);
//     return res.status(500).json({ error: 'Failed to analyze session' });
//   }
// };

exports.getSummaryAnalysis = async (req, res) => {
  const { storeId } = req.params;

  try {
    // Step 1: Get latest 5 *unique* session_ids for this store
    const { rows: sessionRows } = await db.query(
      `
      SELECT DISTINCT ON (session_id) session_id, s3_url, created_at
      FROM sessions
      WHERE store_id = $1 AND s3_url IS NOT NULL
      ORDER BY session_id, created_at DESC
      LIMIT 10
      `,
      [storeId]
    );


    // Avoid duplicate S3 URLs (some session_ids may have multiple rows)
    const seen = new Set();
    const uniqueSessions = sessionRows.filter(row => {
      if (seen.has(row.s3_url)) return false;
      seen.add(row.s3_url);
      return true;
    }).slice(0, 5);

    if (uniqueSessions.length === 0) {
      return res.status(404).json({ error: 'No sessions found for this store' });
    }

    // Step 2: Fetch event data from S3
    const allEvents = [];
    for (const { s3_url } of uniqueSessions) {
      const key = s3_url.split('.com/')[1];
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: 'storereplay-sessions',
        Key: key,
        Expires: 60,
      });

      console.log(`🔍 Fetching S3 URL for analysis: ${signedUrl}`);

      const response = await fetch(signedUrl);
      const events = await response.json();
      allEvents.push(...events.slice(0, 20)); // limit each to 20 events to keep prompt concise
    }

    // Step 3: Run AI summary
    const summaryPrompt = `
You are a UX expert analyzing user behavior across 5 Shopify sessions. Each session includes structured rrweb event data with fields:

- action: hover, click, input, scroll
- tagName: HTML tag (e.g., BUTTON, INPUT)
- className: element class
- textContent: visible element text
- delay: ms since previous event

Based on this data, write a 150-word UX summary of user behaviors. Look for:

1. Rage clicks or frustrated actions
2. Confused or erratic behavior
3. Drop-offs or abandonment
4. High-interest elements
5. Overall navigation flow

⚠️ Do NOT mention internal IDs.
✅ Use tag/class/text descriptions only.

Data:

${JSON.stringify(allEvents.slice(0, 100))}
`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: "You're an expert UX analyst for online Shopify stores." },
        { role: 'user', content: summaryPrompt },
      ],
    });

    const summary = aiResponse.choices[0].message.content;

    return res.status(200).json({ summary });

  } catch (err) {
    console.error('❌ getSummaryAnalysis Error:', err);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
};

