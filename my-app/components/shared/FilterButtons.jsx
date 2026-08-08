'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function FilterButtons({ items = [], paramName = 'category', allLabel = 'الكل' }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get(paramName) || '';

  const go = (value) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(paramName, value); else sp.delete(paramName);
    sp.delete('page');
    router.push(`${pathname}${sp.toString() ? `?${sp}` : ''}`, { scroll: false });
  };

  const cls = (active) => `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
    ${active ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'}`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
      <button type="button" onClick={() => go('')} className={cls(!current)}>{allLabel}</button>
      {items.map((it) => (
        <button key={it.slug || it.value} type="button" onClick={() => go(it.slug || it.value)} className={cls(current === (it.slug || it.value))}>
          {it.name || it.label}
        </button>
      ))}
    </div>
  );
}
