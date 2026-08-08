'use client';

import { useEffect, useRef } from 'react';
import useSocket from './useSocket';

/** Subscribes to one or more realtime events. */
export default function useRealtime(events, handler) {
  const socket = useSocket();
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    if (!socket) return undefined;
    const list = Array.isArray(events) ? events : [events];
    const cb = (payload) => ref.current && ref.current(payload);
    list.forEach((e) => socket.on(e, cb));
    return () => list.forEach((e) => socket.off(e, cb));
  }, [socket, Array.isArray(events) ? events.join(',') : events]);
}
