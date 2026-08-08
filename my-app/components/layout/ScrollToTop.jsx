'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="العودة للأعلى"
      className={`fixed bottom-5 right-5 z-[70] w-11 h-11 rounded-full bg-primary text-white grid place-items-center shadow-hover
        transition-all duration-300 hover:bg-primary-dark hover:-translate-y-1
        ${visible ? 'opacity-100 visible' : 'opacity-0 invisible translate-y-3'}`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
