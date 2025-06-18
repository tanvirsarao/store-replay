const { db } = require('../lib/db');
const { OpenAI } = require('openai');
const fetch = require('node-fetch');
const { s3 } = require('../lib/s3');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.analyzeSession = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const result = await db.query(
      'SELECT s3_url FROM sessions WHERE session_id = $1',
      [sessionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const s3Url = result.rows[0].s3_url;
    const key = s3Url.split('.com/')[1];
    
    const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: 'storereplay-sessions',
        Key: key,
        Expires: 60,
    });
    
    const response = await fetch(signedUrl);


    const sessionEvents = await response.json();


    const summaryPrompt = `
You are a UX expert analyzing user behavior on a Shopify store. You are given structured rrweb event data, where each event contains a "metadata" field with the following:

- action: hover, click, input, scroll
- tagName: the HTML tag name (e.g., BUTTON, INPUT)
- className: class of the element (if any)
- textContent: the visible text on the element
- delay: ms since previous event

Your job is to:
1. Identify rage clicks (repeated clicks on the same element).
2. Spot user confusion (rapid or aimless movements or interactions).
3. Find drop-off points (user stops interacting suddenly).
4. Understand user intent and path (what elements they engage with most).

⚠️ DO NOT reference raw coordinates or internal IDs (e.g., x/y or "id": 3).
✅ Instead, describe elements using their "tag", "class", or "text".

Give a brief paragraph summary with 2–3 short, actionable UX insights.
Here is the user session (first 100 events):

${JSON.stringify(sessionEvents.slice(0, 100))}
`;


    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You're an expert UX analyst for online Shopify stores." },
        { role: "user", content: summaryPrompt },
      ],
    });

    const summary = aiResponse.choices[0].message.content;

    await db.query(
      'UPDATE sessions SET ai_summary = $1 WHERE session_id = $2',
      [summary, sessionId]
    );

    return res.status(200).json({ message: 'Analysis complete', summary });

  } catch (err) {
    console.error('❌ AI Analysis Error:', err);
    return res.status(500).json({ error: 'Failed to analyze session' });
  }
};
