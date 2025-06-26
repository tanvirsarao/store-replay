// // const { db } = require('../lib/db');

// // exports.getMetrics = async (req, res) => {
// //   const { storeId } = req.params;

// //   const { rows: sessions } = await db.query(
// //     `
// //     SELECT
// //       session_id,
// //       SUM(session_time)                           AS session_time,
// //       SUM(event_count)                            AS event_count,
// //       SUM(keypresses)                             AS keypresses,
// //       MIN(first_click_ms)                         AS first_click_ms,
// //       (ARRAY_AGG(last_element_id ORDER BY created_at DESC))[1] AS last_element_id,
// //       MAX(created_at)                             AS last_seen
// //     FROM sessions
// //     WHERE store_id = $1
// //     GROUP BY session_id
// //     `,
// //     [storeId]
// //   );

// //   const totalSessions   = sessions.length || 1;
// //   const sum             = (key) => sessions.reduce((s, r) => s + Number(r[key] || 0), 0);

// //   const avgSessionTime  = sum('session_time')   / totalSessions;
// //   const avgEventsPerMin = (sum('event_count') / (sum('session_time') / 60000 || 1));
// //   const avgKeypresses   = sum('keypresses')     / totalSessions;
// //   const avgFirstClick   = sum('first_click_ms') / totalSessions;

// //   const freq = {};
// //   sessions.forEach(r => {
// //     if (r.last_element_id !== null) {
// //       freq[r.last_element_id] = (freq[r.last_element_id] || 0) + 1;
// //     }
// //   });
// //   const [mostDropOffElement] =
// //     Object.entries(freq).sort((a, b) => b[1] - a[1])[0] || [null];

// //   const last10 = sessions
// //     .sort((a, b) => b.last_seen - a.last_seen)
// //     .slice(0, 10)
// //     .map(r => ({
// //       sessionId: r.session_id,
// //       time:      Number(r.session_time),
// //       clicks:    Number(r.event_count),
// //     }));

// //   res.json({
// //     totalSessions,
// //     avgSessionTime,
// //     avgEventsPerMin,
// //     avgKeypresses,
// //     avgFirstClick,
// //     mostDropOffElement,
// //     last10Sessions: last10,
// //   });
// // };


// const { db } = require('../lib/db');
// const fetch = require('node-fetch');
// const { s3 } = require('../lib/s3');

// exports.getMetrics = async (req, res) => {
//   const { storeId } = req.params;

//   const { rows: sessions } = await db.query(
//     `
//     SELECT
//       session_id,
//       s3_url,
//       SUM(session_time)                           AS session_time,
//       SUM(event_count)                            AS event_count,
//       SUM(keypresses)                             AS keypresses,
//       MIN(first_click_ms)                         AS first_click_ms,
//       (ARRAY_AGG(last_element_id ORDER BY created_at DESC))[1] AS last_element_id,
//       MAX(created_at)                             AS last_seen
//     FROM sessions
//     WHERE store_id = $1
//     GROUP BY session_id, s3_url
//     `,
//     [storeId]
//   );

//   const totalSessions   = sessions.length || 1;
//   const sum             = (key) => sessions.reduce((s, r) => s + Number(r[key] || 0), 0);

//   const avgSessionTime  = sum('session_time')   / totalSessions;
//   const avgEventsPerMin = (sum('event_count') / (sum('session_time') / 60000 || 1));
//   const avgKeypresses   = sum('keypresses')     / totalSessions;
//   const avgFirstClick   = sum('first_click_ms') / totalSessions;

//   const freq = {};
//   const idToS3 = {};

//   sessions.forEach(r => {
//     if (r.last_element_id !== null) {
//       freq[r.last_element_id] = (freq[r.last_element_id] || 0) + 1;
//       idToS3[r.last_element_id] = r.s3_url; // assumes each ID maps to its s3_url
//     }
//   });

//   // let mostDropOffElement = null;
//   const [mostId] = Object.entries(freq).sort((a, b) => b[1] - a[1])[0] || [];

//   if (mostId) {
//     try {
//       const s3Url = idToS3[mostId];
//       const key = s3Url.split('.com/')[1];
//       const signedUrl = s3.getSignedUrl('getObject', {
//         Bucket: 'storereplay-sessions',
//         Key: key,
//         Expires: 60,
//       });
//       const response = await fetch(signedUrl);
//       const events = await response.json();

//       const match = events.find(e => e.metadata?.id === mostId);
//       if (match) {
//         mostDropOffElement = {
//           tag: match.metadata?.tagName || null,
//           class: match.metadata?.className || null,
//           text: match.metadata?.textContent || null
//         };
//       }
//     } catch (e) {
//       console.error('❌ Failed to fetch element context for drop-off:', e);
//     }
//   }

//   const last10 = sessions
//     .sort((a, b) => b.last_seen - a.last_seen)
//     .slice(0, 10)
//     .map(r => ({
//       sessionId: r.session_id,
//       time:      Number(r.session_time),
//       clicks:    Number(r.event_count),
//     }));

//     const [mostDropOffId] = Object.entries(freq).sort((a, b) => b[1] - a[1])[0] || [null];

// let mostDropOffElement = null;

// if (mostDropOffId) {
//   try {
//     const result = await db.query(
//       `SELECT s3_url FROM sessions WHERE last_element_id = $1 AND store_id = $2 ORDER BY created_at DESC LIMIT 1`,
//       [mostDropOffId, storeId]
//     );

//     if (result.rows.length > 0) {
//       const key = result.rows[0].s3_url.split('.com/')[1];

//       const signedUrl = s3.getSignedUrl('getObject', {
//         Bucket: 'storereplay-sessions',
//         Key: key,
//         Expires: 60,
//       });

//       const response = await fetch(signedUrl);
//       const sessionData = await response.json();

//       const matching = sessionData.find((event) => {
//         const positions = event?.data?.positions || [];
//         return positions.some(p => String(p.id) === String(mostDropOffId));
//       });

//       if (matching?.metadata) {
//         const { tagName, className, textContent } = matching.metadata;
//         mostDropOffElement = `${tagName || 'ELEMENT'}${className ? `.${className}` : ''}${textContent ? ` "${textContent.trim()}"` : ''}`;
//       } else {
//         mostDropOffElement = `Element ID: ${mostDropOffId}`;
//       }
//     }
//   } catch (err) {
//     console.error('⚠️ Error parsing mostDropOffElement:', err);
//   }
// }


//   res.json({
//     totalSessions,
//     avgSessionTime,
//     avgEventsPerMin,
//     avgKeypresses,
//     avgFirstClick,
//     mostDropOffElement,
//     last10Sessions: last10,
//   });
// };

const { db } = require('../lib/db');
const fetch = require('node-fetch');
const { s3 } = require('../lib/s3');

exports.getMetrics = async (req, res) => {
  const { storeId } = req.params;

  const { rows: sessions } = await db.query(
    `
    SELECT
      session_id,
      s3_url,
      SUM(session_time)                           AS session_time,
      SUM(event_count)                            AS event_count,
      SUM(keypresses)                             AS keypresses,
      MIN(first_click_ms)                         AS first_click_ms,
      MAX(created_at)                             AS last_seen
    FROM sessions
    WHERE store_id = $1
    GROUP BY session_id, s3_url
    `,
    [storeId]
  );

  const totalSessions   = sessions.length || 1;
  const sum             = (key) => sessions.reduce((s, r) => s + Number(r[key] || 0), 0);

  const avgSessionTime  = sum('session_time')   / totalSessions;
  const avgEventsPerMin = (sum('event_count') / (sum('session_time') / 60000 || 1));
  const avgKeypresses   = sum('keypresses')     / totalSessions;
  const avgFirstClick   = sum('first_click_ms') / totalSessions;

  const last10 = sessions
    .sort((a, b) => b.last_seen - a.last_seen)
    .slice(0, 10)
    .map(r => ({
      sessionId: r.session_id,
      time:      Number(r.session_time),
      clicks:    Number(r.event_count),
    }));

  let mostDropOffElement = null;

  try {
    const topSession = sessions.sort((a, b) => b.session_time - a.session_time)[0];
    const key = topSession.s3_url.split('.com/')[1];

    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: 'storereplay-sessions',
      Key: key,
      Expires: 60,
    });

    const response = await fetch(signedUrl);
    const sessionData = await response.json();

    const freqMap = {};

    for (const event of sessionData) {
      const { metadata } = event;
      if (!metadata || !metadata.tagName) continue;

      const tag = metadata.tagName;
      const cls = metadata.className || '';
      const txt = metadata.textContent?.trim() || '';
      const key = `${tag}|${cls}|${txt}`;

      freqMap[key] = (freqMap[key] || 0) + 1;
    }

    const [topEntry] = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);

    if (topEntry) {
      const [tag, cls, txt] = topEntry[0].split('|');
      mostDropOffElement =
        `${tag}${cls ? '.' + cls : ''}${txt ? ` "${txt}"` : ''}`;
    }
  } catch (err) {
    console.error('⚠️ Error determining mostDropOffElement:', err);
  }

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
