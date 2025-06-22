// // controllers/analysisController.js
// const { db } = require('../lib/db');
// const { OpenAI } = require('openai');
// const fetch = require('node-fetch');
// const { s3 } = require('../lib/s3');

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

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

// exports.getSummaryAnalysis = async (req, res) => {
//   const { storeId } = req.params;

//   try {
//     // Step 1: Get latest 5 *unique* session_ids for this store
//     const { rows: sessionRows } = await db.query(
//       `
//       SELECT DISTINCT ON (session_id) session_id, s3_url, created_at
//       FROM sessions
//       WHERE store_id = $1 AND s3_url IS NOT NULL
//       ORDER BY session_id, created_at DESC
//       LIMIT 10
//       `,
//       [storeId]
//     );


//     // Avoid duplicate S3 URLs (some session_ids may have multiple rows)
//     const seen = new Set();
//     const uniqueSessions = sessionRows.filter(row => {
//       if (seen.has(row.s3_url)) return false;
//       seen.add(row.s3_url);
//       return true;
//     }).slice(0, 5);

//     if (uniqueSessions.length === 0) {
//       return res.status(404).json({ error: 'No sessions found for this store' });
//     }

//     // Step 2: Fetch event data from S3
//     const allEvents = [];
//     for (const { s3_url } of uniqueSessions) {
//       const key = s3_url.split('.com/')[1];
//       const signedUrl = s3.getSignedUrl('getObject', {
//         Bucket: 'storereplay-sessions',
//         Key: key,
//         Expires: 60,
//       });

//       console.log(`🔍 Fetching S3 URL for analysis: ${signedUrl}`);

//       const response = await fetch(signedUrl);
//       const events = await response.json();
//       allEvents.push(...events.slice(0, 20)); // limit each to 20 events to keep prompt concise
//     }

//     // Step 3: Run AI summary
//     const summaryPrompt = `
// You are a UX expert analyzing user behavior across 5 Shopify sessions. Each session includes structured rrweb event data with fields:

// - action: hover, click, input, scroll
// - tagName: HTML tag (e.g., BUTTON, INPUT)
// - className: element class
// - textContent: visible element text
// - delay: ms since previous event

// Based on this data, write a 150-word UX summary of user behaviors. Look for:

// 1. Rage clicks or frustrated actions
// 2. Confused or erratic behavior
// 3. Drop-offs or abandonment
// 4. High-interest elements
// 5. Overall navigation flow

// ⚠️ Do NOT mention internal IDs.
// ✅ Use tag/class/text descriptions only.

// Data:

// ${JSON.stringify(allEvents.slice(0, 100))}
// `;

//     const aiResponse = await openai.chat.completions.create({
//       model: 'gpt-4',
//       messages: [
//         { role: 'system', content: "You're an expert UX analyst for online Shopify stores." },
//         { role: 'user', content: summaryPrompt },
//       ],
//     });

//     const summary = aiResponse.choices[0].message.content;

//     return res.status(200).json({ summary });

//   } catch (err) {
//     console.error('❌ getSummaryAnalysis Error:', err);
//     return res.status(500).json({ error: 'Failed to generate summary' });
//   }
// };



const { db } = require('../lib/db');
const fetch = require('node-fetch');
const { s3 } = require('../lib/s3');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * GET /api/analysis/:storeId
 * Combines DB metrics + shallow rage-click scan + GPT-4o summary/recs.
 */
exports.getFullAnalysis = async (req, res) => {
  const { storeId } = req.params;

  try {
    /* ─────────────────────── 1. Core metrics  ─────────────────────── */
    const { rows: sessions } = await db.query(
      `
      SELECT
        session_id,
        s3_url,
        SUM(session_time)   AS session_time,
        SUM(event_count)    AS event_count,
        SUM(keypresses)     AS keypresses,
        MIN(first_click_ms) AS first_click_ms
      FROM sessions
      WHERE store_id = $1
      GROUP BY session_id, s3_url
      `,
      [storeId]
    );

    const totalSessions = sessions.length || 1;
    const sum = (key) => sessions.reduce((s, r) => s + Number(r[key] || 0), 0);

    const avgSessionTime  = sum('session_time') / totalSessions;
    const avgEventsPerMin = sum('event_count') / (sum('session_time') / 60000 || 1);
    const avgKeypresses   = sum('keypresses')   / totalSessions;
    const avgFirstClick   = sum('first_click_ms') / totalSessions;

    /* ───────────────────── 2. Quick rage-click scan ───────────────── */
    // naïve: inspect first 3 sessions only (keeps it fast)
    let rageSessions = 0;
    for (const session of sessions.slice(0, 3)) {
      const key = session.s3_url.split('.com/')[1];
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: 'storereplay-sessions',
        Key: key,
        Expires: 60
      });
      const data = await fetch(signedUrl).then(r => r.json());

      const clicks = data.filter(
        (e) => e.type === 3 && e.data?.source === 2 && e.metadata?.tagName
      );
      const byKey = {};
      clicks.forEach(c => {
        const k = `${c.metadata.tagName}|${c.metadata.textContent}`;
        (byKey[k] ||= []).push(c.timestamp);
      });
      const hasRage = Object.values(byKey).some((times) =>
        times.sort().some((t, i) => i && t - times[i - 1] < 500)
      );
      if (hasRage) rageSessions++;
    }
    const rageClickRate = ((rageSessions / totalSessions) * 100).toFixed(1) + '%';

    /* ─────────────── 3. Ask GPT-4o to build JSON  ─────────────────── */
    const prompt = `
You are a CRO and UX expert.  
Given the store metrics below, output **only valid JSON** with ALL of these keys:

{
  "rageClickRate": "<string %>",
  "userFrustrationScore": <int 0-100>,
  "potentialConversation": "<string %>",
  "engagementScore": <int 0-100>,
  "summary": "<≤150 words>",
  "optimizationReccomendation1": { priority,title,Description },
  "optimizationReccomendation2": { priority,title,Description },
  "optimizationReccomendation3": { priority,title,Description }
}

Metrics:
- totalSessions: ${totalSessions}
- avgSessionTime (ms): ${avgSessionTime.toFixed(0)}
- avgEventsPerMin: ${avgEventsPerMin.toFixed(1)}
- avgKeypresses: ${avgKeypresses.toFixed(1)}
- avgFirstClick (ms): ${avgFirstClick.toFixed(0)}
- rageClickRate: ${rageClickRate}
`;

    const ai = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Return only JSON.' },
        { role: 'user',   content: prompt }
      ]
    });

    const analysis = JSON.parse(ai.choices[0].message.content);

    res.json(analysis);

  } catch (err) {
    console.error('❌ /api/analysis Error:', err);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
};
