'use client';

import { useState } from 'react';
import Accordion from './Accordion';

export default function FaqTabs({ faqs = [], categories = [] }) {
  const [active, setActive] = useState('');

  const used = categories.filter((c) => faqs.some((f) => String(f.category?._id || f.category) === String(c._id)));
  const list = active ? faqs.filter((f) => String(f.category?._id || f.category) === active) : faqs;

  const cls = (on) => `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
    ${on ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'}`;

  return (
    <>
      {used.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-9">
          <button type="button" onClick={() => setActive('')} className={cls(!active)}>الكل</button>
          {used.map((c) => (
            <button key={c._id} type="button" onClick={() => setActive(String(c._id))} className={cls(active === String(c._id))}>
              {c.name}
            </button>
          ))}
        </div>
      )}
      <Accordion items={list} defaultOpen={0} />
    </>
  );
}
