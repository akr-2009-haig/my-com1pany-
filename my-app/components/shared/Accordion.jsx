'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items = [], allowMultiple = false, defaultOpen = -1 }) {
  const [open, setOpen] = useState(defaultOpen >= 0 ? [defaultOpen] : []);

  const toggle = (i) => {
    setOpen((cur) => {
      if (cur.includes(i)) return cur.filter((x) => x !== i);
      return allowMultiple ? [...cur, i] : [i];
    });
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open.includes(i);
        return (
          <div key={item.id || i} className={`rounded-xl border transition-colors duration-300 overflow-hidden ${isOpen ? 'border-primary/40 bg-primary/[.04]' : 'border-gray-200 bg-white'}`}>
            <button
              type="button" onClick={() => toggle(i)} aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-right px-5 py-4"
            >
              <span className={`font-semibold text-[15px] ${isOpen ? 'text-primary' : 'text-dark'}`}>{item.question || item.title}</span>
              <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="px-5 pb-5 prose-rtl text-sm" dangerouslySetInnerHTML={{ __html: item.answer || item.content || '' }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
