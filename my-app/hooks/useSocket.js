'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

let shared = null;

/** One shared socket connection for the whole browser tab. */
export function getSocket() {
  if (typeof window === 'undefined') return null;
  if (!shared) {
    shared = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1500,
      reconnectionAttempts: 20,
    });
  }
  return shared;
}

export default function useSocket() {
  const [socket, setSocket] = useState(null);
  useEffect(() => { setSocket(getSocket()); }, []);
  return socket;
}
