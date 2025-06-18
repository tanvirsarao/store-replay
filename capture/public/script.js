const eventBuffer = [];
let lastEventTime = Date.now();

rrweb.record({
  emit(event) {
    const now = Date.now();
    const timeSinceLastEvent = now - lastEventTime;
    lastEventTime = now;

    const enrichedEvent = {
      ...event,
      metadata: {},
      delay: timeSinceLastEvent,
    };

    // Hover detection (mousemove)
    if (event.type === 3 && event.data?.x && event.data?.y) {
      const el = document.elementFromPoint(event.data.x, event.data.y);
      if (el) {
        enrichedEvent.metadata = {
          action: 'hover',
          tagName: el.tagName,
          className: el.className,
          textContent: el.textContent?.trim().slice(0, 50),
        };
      }
    }

    // Click detection
    if (event.type === 1 && event.data?.source === 2) {
      const el = document.elementFromPoint(event.data.x, event.data.y);
      if (el) {
        enrichedEvent.metadata = {
          action: 'click',
          tagName: el.tagName,
          className: el.className,
          textContent: el.textContent?.trim().slice(0, 50),
        };
      }
    }

    // Input detection
    if (event.type === 1 && event.data?.source === 3 && event.data?.text) {
      enrichedEvent.metadata = {
        action: 'input',
        text: event.data.text?.slice(0, 100),
      };
    }

    // Scroll detection
    if (event.type === 1 && event.data?.source === 1) {
      enrichedEvent.metadata = {
        action: 'scroll',
        position: event.data,
      };
    }

    eventBuffer.push(enrichedEvent);
  }
});

// Send batched events every 5 seconds
setInterval(() => {
  if (eventBuffer.length > 0) {
    const eventsToSend = [...eventBuffer];
    eventBuffer.length = 0;

    fetch('http://localhost:3000/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: crypto.randomUUID(),
        timestamp: Date.now(),
        events: eventsToSend,
      }),
    }).then(() => {
      console.log('✅ Sent events batch to server');
    }).catch(err => {
      console.error('❌ Failed to send events:', err);
    });
  }
}, 5000);
