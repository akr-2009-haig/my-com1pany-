import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

/** Server-friendly pagination based on query-string links. */
export default function Pagination({ page = 1, pages = 1, basePath = '', query = {} }) {
  if (pages <= 1) return null;

  const href = (p) => {
    const sp = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => { if (v && k !== 'page') sp.set(k, v); });
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return `${basePath}${qs ? `?${qs}` : ''}`;
  };

  const nums = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(pages, from + 4);
  for (let i = Math.max(1, to - 4); i <= to; i += 1) nums.push(i);

  const cls = (active) => `w-10 h-10 rounded-lg grid place-items-center text-sm font-semibold transition-colors
    ${active ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`;

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="ترقيم الصفحات">
      {page > 1 && (
        <Link href={href(page - 1)} className={cls(false)} aria-label="السابق"><ChevronRight className="w-4 h-4" /></Link>
      )}
      {from > 1 && (<><Link href={href(1)} className={cls(page === 1)}>1</Link><span className="text-gray-400 px-1">…</span></>)}
      {nums.map((n) => <Link key={n} href={href(n)} className={cls(n === page)}>{n}</Link>)}
      {to < pages && (<><span className="text-gray-400 px-1">…</span><Link href={href(pages)} className={cls(page === pages)}>{pages}</Link></>)}
      {page < pages && (
        <Link href={href(page + 1)} className={cls(false)} aria-label="التالي"><ChevronLeft className="w-4 h-4" /></Link>
      )}
    </nav>
  );
}
