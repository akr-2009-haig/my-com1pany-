'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import useRealtime from '../../hooks/useRealtime';

/**
 * Refreshes the server-rendered public pages whenever the admin changes
 * content, so edits appear instantly without a manual reload.
 */
export default function RealtimeRefresher() {
  const router = useRouter();
  const last = useRef(0);

  useRealtime('content:changed', () => {
    const now = Date.now();
    if (now - last.current < 1200) return;
    last.current = now;
    router.refresh();
  });

  return null;
}
