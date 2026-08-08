const { getIO } = require('../lib/socket');

/** Broadcasts a realtime event to every connected client (public + admin). */
function emitEvent(eventName, payload = {}) {
  const io = getIO();
  if (!io) return;
  io.emit(eventName, { ...payload, at: Date.now() });
  io.emit('content:changed', { event: eventName, ...payload, at: Date.now() });
}

module.exports = emitEvent;
