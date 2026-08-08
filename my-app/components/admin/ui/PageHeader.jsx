'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ADMIN_BASE } from '../../../utils/constants';

export default function PageHeader({
  title, subtitle, breadcrumb = [], actions, icon,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div className="min-w-0">
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-1.5 flex-wrap">
          <Link href={ADMIN_BASE} className="hover:text-primary">لوحة التحكم</Link>
          {breadcrumb.map((b) => (
            <span key={b.label} className="flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" />
              {b.href ? <Link href={b.href} className="hover:text-primary">{b.label}</Link> : <span>{b.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="admin-title flex items-center gap-2">{icon}{title}</h1>
        {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
