'use client';

import { ShieldAlert, Loader2 } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';

/** Client-side permission gate for an admin screen. */
export default function Guard({ module: mod, action = 'view', children }) {
  const { user, ready, can } = useAuth();

  if (!ready) {
    return (
      <div className="py-24 grid place-items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !can(mod, action)) {
    return (
      <div className="admin-card p-10 text-center max-w-lg mx-auto mt-10">
        <ShieldAlert className="w-14 h-14 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-dark mb-2">لا تملك صلاحية الوصول</h2>
        <p className="text-sm text-gray-500">هذا القسم غير متاح لدورك الحالي. تواصل مع مدير النظام لمنحك الصلاحية المناسبة.</p>
      </div>
    );
  }

  return children;
}
