'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Styled custom dropdown used across the public forms (contact / quote /
 * careers). Supports:
 *  - placeholder (light gray)
 *  - string options OR { label, desc } options
 *  - optional emoji icon prefix (💰 / ⏱️ …) via `showIcon`
 *  - optional short descriptions under each option via `showDescriptions`
 *  - rotating chevron, open animation, hover highlight (#E0F7FA),
 *    and a cyan selected-dot marker
 */
export default function DropdownField({
  value = '',
  onChange,
  options = [],
  placeholder = 'اختر...',
  icon = '',
  showIcon = false,
  showDescriptions = false,
  required = false,
  name,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const list = Array.isArray(options) ? options : [];
  const opts = list.map((o) => (typeof o === 'string' ? { label: o, desc: '' } : { label: o?.label ?? '', desc: o?.desc ?? '' }));

  const selected = opts.find((o) => o.label === value);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const displayText = selected ? selected.label : '';

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        name={name}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={placeholder}
        onClick={() => setOpen((s) => !s)}
        className={`input w-full flex items-center justify-between gap-2 text-right ${selected ? 'text-[#333]' : 'text-gray-300'} ${open ? 'ring-2 ring-primary/30 border-primary' : ''}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected && showIcon && icon ? <span className="shrink-0">{icon}</span> : null}
          <span className="truncate">{displayText || placeholder}</span>
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute z-30 top-full right-0 left-0 mt-2 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden animate-dropdown">
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1.5">
            {!opts.length ? <li className="px-4 py-3 text-sm text-gray-400">لا توجد خيارات</li> : null}
            {opts.map((o) => {
              const active = o.label === value;
              return (
                <li key={o.label}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { onChange(o.label); setOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-right text-sm transition-colors duration-150
                      ${active ? 'bg-[#E0F7FA] text-[#00838F] font-semibold' : 'text-[#333] hover:bg-[#E0F7FA] hover:text-[#00838F]'}`}
                  >
                    <span className="w-4 shrink-0">{active ? <Check className="w-4 h-4 text-[#00BCD4]" /> : null}</span>
                    <span className="min-w-0">
                      <span className="block truncate">
                        {showIcon && icon ? <span className="ml-1.5">{icon}</span> : null}
                        {o.label}
                      </span>
                      {showDescriptions && o.desc ? (
                        <span className="block text-xs text-gray-400 mt-0.5 truncate">{o.desc}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
