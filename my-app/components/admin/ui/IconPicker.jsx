'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Icon, { ICON_NAMES } from '../../shared/Icon';

export default function IconPicker({ value = 'Sparkles', onChange, label }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const list = useMemo(
    () => (q ? ICON_NAMES.filter((n) => n.toLowerCase().includes(q.toLowerCase())) : ICON_NAMES),
    [q],
  );

  return (
    <div>
      {label ? <span className="label">{label}</span> : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between gap-3 text-right"
      >
        <span className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <Icon name={value} className="w-5 h-5" />
          </span>
          <span className="text-sm">{value || 'اختر أيقونة'}</span>
        </span>
        <span className="text-xs text-gray-400">{open ? 'إغلاق' : 'تغيير'}</span>
      </button>

      {open ? (
        <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-card p-3">
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث بالاسم (بالإنجليزية)..."
              className="input pr-9 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-56 overflow-y-auto">
            {list.map((n) => (
              <button
                key={n}
                type="button"
                title={n}
                onClick={() => { onChange?.(n); setOpen(false); }}
                className={`aspect-square grid place-items-center rounded-lg border transition-colors
                  ${value === n ? 'border-primary bg-primary/10 text-primary' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                <Icon name={n} className="w-5 h-5" />
              </button>
            ))}
            {!list.length ? <p className="col-span-full text-center text-xs text-gray-400 py-4">لا توجد نتائج</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
