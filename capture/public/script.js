// /* 0️⃣  grab storeId (merchant embed sets this) */
// const storeId = window.storeReplayConfig?.storeId || 'UNKNOWN_STORE';

// const eventBuffer   = [];
// let   lastEventTime = Date.now();

// /* 1️⃣  rrweb recorder */
// rrweb.record({
//   emit(event) {
//     const now  = Date.now();
//     const evt  = { ...event, delay: now - lastEventTime, metadata: {} };
//     lastEventTime = now;

//     // /* quick action tagging (unchanged) */
//     // if (event.type === 3 && event.data?.x)                    evt.metadata.action = 'hover';
//     // if (event.type === 1 && event.data?.source === 2)         evt.metadata.action = 'click';
//     // if (event.type === 1 && event.data?.source === 3)         evt.metadata.action = 'input';
//     // if (event.type === 1 && event.data?.source === 1)         evt.metadata.action = 'scroll';

//     // eventBuffer.push(evt);
//   }
// });

// /* 2️⃣  send a batch every 5 s */
// setInterval(() => {
//   if (!eventBuffer.length) return;

//   const eventsToSend = [...eventBuffer];
//   eventBuffer.length = 0;          // clear buffer

//   fetch('http://localhost:3000/api/sessions', {
//     method : 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body   : JSON.stringify({
//       sessionId : crypto.randomUUID(),
//       storeId,                           // ← added line
//       timestamp : Date.now(),
//       events    : eventsToSend
//     })
//   })
//     .then(() => console.log('✅ Sent events batch to server'))
//     .catch(err => console.error('❌ Failed to send events:', err));
// }, 5000);












/* 0️⃣  grab storeId (merchant embed sets this) */
const storeId = window.storeReplayConfig?.storeId || 'UNKNOWN_STORE';

const eventBuffer   = [];
let   lastEventTime = Date.now();

/* 1️⃣  rrweb recorder */
// rrweb.record({
//   emit(event) {
//     const now  = Date.now();
//     const evt  = { ...event, delay: now - lastEventTime, metadata: {} };
//     lastEventTime = now;

//     eventBuffer.push(evt);
//   }
  
// });

rrweb.record({
  emit(event) {
    const now = Date.now();
    const metadata = {};

    // Handle click/hover events (source: 2)
    if (event.type === 3 && event.data?.source === 2) {
      const el = document.elementFromPoint(event.data.x, event.data.y);
      if (el) {
        metadata.tagName = el.tagName;
        metadata.className = el.className;
        metadata.textContent = el.textContent?.trim().slice(0, 100);
      }
    }

    // Handle pointer-move batches (source: 1)
    if (event.type === 3 && event.data?.source === 1 && Array.isArray(event.data.positions)) {
      const { x, y } = event.data.positions.at(-1);  // last cursor position
      const el = document.elementFromPoint(x, y);
      if (el) {
        metadata.tagName = el.tagName;
        metadata.className = el.className;
        metadata.textContent = el.textContent?.trim().slice(0, 100);
      }
    }

    const enrichedEvent = {
      ...event,
      delay: now - lastEventTime,
      metadata,
    };

    lastEventTime = now;
    eventBuffer.push(enrichedEvent);
  }
});




setInterval(() => {
  if (!eventBuffer.length) return;

  const eventsToSend = [...eventBuffer];
  eventBuffer.length = 0;
  
  const sessionId = window.sessionStorage.getItem('storeReplaySessionId') || crypto.randomUUID();
  window.sessionStorage.setItem('storeReplaySessionId', sessionId);

  const storeId = window.storeReplayConfig?.storeId || 'UNKNOWN_STORE';
  const timestamp = Date.now();

  console.log("📤 Sending to backend:", {
    sessionId,
    storeId,
    timestamp,
    events: eventsToSend.length
  });

  fetch('http://localhost:3000/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      storeId,
      timestamp,
      events: eventsToSend
    })
  })
    .then(res => res.json())
    .then(data => console.log('✅ Backend response:', data))
    .catch(err => console.error('❌ Fetch failed:', err));
}, 5000);




// /* 2️⃣  send a batch every 5 s */
// setInterval(() => {
//   if (!eventBuffer.length) return;

//   const eventsToSend = [...eventBuffer];
//   eventBuffer.length = 0;          // clear buffer
//   const firstEvent = eventsToSend[0];
//   const lastEvent  = eventsToSend.at(-1);

//   // Extract values
//   const eventCount = eventsToSend.length;
//   const sessionTime = lastEvent.timestamp - firstEvent.timestamp;
//   const keypresses = eventsToSend.filter(e => e.data?.source === 5).length;
//   const firstClick = eventsToSend.find(e => e.data?.source === 2 && e.data?.type === 0);
//   const firstClickMs = firstClick ? firstClick.timestamp - firstEvent.timestamp : null;

//   const interactive = eventsToSend.filter(e => e.data?.id !== undefined);
//   const lastElementId = interactive.at(-1)?.data?.id ?? null;

//   // Final payload
//   fetch('http://localhost:3000/api/sessions', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       sessionId: crypto.randomUUID(),
//       storeId,
//       timestamp: Date.now(),
//       events: eventsToSend,

//       // ⬇️ New stats
//       eventCount,
//       sessionTime,
//       keypresses,
//       firstClickMs,
//       lastElementId
//     })
//   })
//     .then(() => console.log('✅ Sent events batch to server'))
//     .catch(err => console.error('❌ Failed to send events:', err));
// }, 5000);


