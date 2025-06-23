const storeId = window.storeReplayConfig?.storeId || 'UNKNOWN_STORE';

const eventBuffer   = [];
let   lastEventTime = Date.now();

rrweb.record({
  emit(event) {
    const now = Date.now();
    const metadata = {};

    if (event.type === 3 && event.data?.source === 2) {
      const el = document.elementFromPoint(event.data.x, event.data.y);
      if (el) {
        metadata.tagName = el.tagName;
        metadata.className = el.className;
        metadata.textContent = el.textContent?.trim().slice(0, 100);
      }
    }

    if (event.type === 3 && event.data?.source === 1 && Array.isArray(event.data.positions)) {
      const { x, y } = event.data.positions.at(-1);
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

  fetch(`${window.storeReplayConfig?.apiBase || ''}/api/sessions`, {
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
