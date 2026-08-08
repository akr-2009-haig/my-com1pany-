import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function Breadcrumb({ items = [], light = false }) {
  const base = light ? 'text-white/70' : 'text-gray-500';
  const current = light ? 'text-primary' : 'text-primary';

  return (
    <nav aria-label="مسار التنقل" className={`flex items-center justify-center flex-wrap gap-1.5 text-sm ${base}`}>
      <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
      {items.map((item, i) => (
        <span key={item.href || item.label} className="flex items-center gap-1.5">
          <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
          {i === items.length - 1 || !item.href
            ? <span className={`font-medium ${current}`}>{item.label}</span>
            : <Link href={item.href} className="hover:text-primary transition-colors">{item.label}</Link>}
        </span>
      ))}
    </nav>
  );
}
