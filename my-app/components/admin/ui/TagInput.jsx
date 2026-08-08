'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

/** Simple chip input backed by an array of strings. */
export default function TagInput({ value = [], onChange, label, placeholder = 'اكتب واضغط Enter' }) {
  const [text, setText] = useState('');
  const list = Array.isArray(value) ? value : [];

  const add = (raw) => {
    const v = String(raw || '').trim();
    if (!v || list.includes(v)) { setText(''); return; }
    onChange?.([...list, v]);
    setText('');
  };

  return (
    <div>
      {label ? <span className="label">{label}</span> : null}
      <div className="input flex flex-wrap items-center gap-1.5 min-h-[46px] py-2">
        {list.map((t) => (
          <span key={t} className="badge-primary gap-1">
            {t}
            <button type="button" onClick={() => onChange?.(list.filter((x) => x !== t))} aria-label="حذف">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(text); }
            if (e.key === 'Backspace' && !text && list.length) onChange?.(list.slice(0, -1));
          }}
          onBlur={() => add(text)}
        />
      </div>
    </div>
  );
}
