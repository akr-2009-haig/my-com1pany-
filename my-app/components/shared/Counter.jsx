'use client';

import { useEffect, useRef, useState } from 'react';

/** Animated counter that starts when the element enters the viewport. */
export default function Counter({ value = 0, duration = 1800, className = '' }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const target = Number(value) || 0;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - p) ** 3;
        setDisplay(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === 'undefined') { run(); return undefined; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && run()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return <span ref={ref} className={className}>{new Intl.NumberFormat('en-US').format(display)}</span>;
}
