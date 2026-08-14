'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Plus, Check, ChevronDown, Folder } from 'lucide-react';

/**
 * Searchable combobox for the project "التصنيف" field.
 * - type to filter the list
 * - pick an existing category (cyan dot on the selected one)
 * - create a brand-new category via the "+ إضافة تصنيف جديد" action
 */
export default function CategoryCombobox({
  value = '',
  onChange,
  options = [],
  onCreate,
  placeholder = 'ابحث أو اختر تصنيفاً...',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const rootRef = useRef(null);

  const list = Array.isArray(options) ? options : [];
  const selected = list.find((c) => String(c._id) === String(value));
  const filtered = query
    ? list.filter((c) => `${c.name || ''}`.toLowerCase().includes(query.toLowerCase()))
    : list;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) { setOpen(false); setQuery(''); } };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleCreate = async () => {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    try {
      const created = await onCreate(name);
      onChange(created?._id || created?.id || '');
      setOpen(false);
      setQuery('');
    } catch {
      /* handled by caller */
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <span className="label">التصنيف</span>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className={`input w-full flex items-center justify-between gap-2 text-right ${selected ? 'text-dark' : 'text-gray-400'} ${open ? 'ring-2 ring-primary/30 border-primary' : ''}`}
        >
          <span className="flex items-center gap-2 min-w-0">
            <Folder className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="truncate">{selected ? selected.name : placeholder}</span>
          </span>
          <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open ? (
          <div className="absolute z-30 top-full right-0 left-0 mt-2 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden animate-dropdown">
            <div className="relative border-b border-gray-100">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                autoFocus
                className="w-full pl-3 pr-9 py-2.5 text-sm focus:outline-none"
                placeholder="ابحث عن تصنيف..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(); } }}
              />
            </div>

            <ul className="max-h-52 overflow-y-auto py-1.5">
              {!filtered.length ? (
                <li className="px-4 py-3 text-sm text-gray-400">لا توجد نتائج</li>
              ) : null}
              {filtered.map((c) => {
                const active = String(c._id) === String(value);
                return (
                  <li key={c._id}>
                    <button
                      type="button"
                      onClick={() => { onChange(String(c._id)); setOpen(false); setQuery(''); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-right text-sm transition-colors
                        ${active ? 'bg-[#E0F7FA] text-[#00838F] font-semibold' : 'text-[#333] hover:bg-[#E0F7FA] hover:text-[#00838F]'}`}
                    >
                      <span className="w-4 shrink-0">{active ? <Check className="w-4 h-4 text-[#00BCD4]" /> : null}</span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-gray-100 p-1.5">
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || !query.trim()}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> {creating ? 'جارٍ الإضافة...' : `+ إضافة تصنيف جديد`}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
