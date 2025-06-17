import { record } from 'rrweb';

record({
  emit(event) {
    console.log('Event:', event); // For testing
    // TODO: batch and send to backend
  }
});
