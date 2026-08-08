'use client';

import { useEffect, useState } from 'react';

export default function TableOfContents({ headings = [] }) {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!headings.length) return undefined;
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-100px 0px -70% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  if (!headings.length) return <div className="hidden lg:block" />;

  return (
    <nav className="hidden lg:block lg:sticky lg:top-28 self-start" aria-label="جدول المحتويات">
      <div className="card p-5">
        <h2 className="font-bold text-dark mb-4 text-sm">جدول المحتويات</h2>
        <ul className="space-y-1.5 text-sm">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? 'pr-4' : ''}>
              <a
                href={`#${h.id}`}
                className={`block py-1 border-r-2 pr-3 transition-colors ${active === h.id ? 'border-primary text-primary font-semibold' : 'border-transparent text-gray-500 hover:text-primary'}`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
