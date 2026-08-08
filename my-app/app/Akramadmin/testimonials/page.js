'use client';

import { Star } from 'lucide-react';
import CrudPage from '../../../components/admin/crud/CrudPage';

export default function TestimonialsPage() {
  return (
    <CrudPage
      endpoint="/testimonials"
      module="testimonials"
      title="آراء العملاء"
      subtitle="الشهادات التي تظهر في قسم آراء العملاء"
      breadcrumb={[{ label: 'العملاء والشركاء' }, { label: 'آراء العملاء' }]}
      addLabel="إضافة رأي"
      reorderable
      modalSize="lg"
      dragTitle={(r) => r.name}
      defaults={{ name: '', position: '', company: '', avatar: '', content: '', rating: 5, isActive: true }}
      columns={[
        {
          key: 'name',
          label: 'العميل',
          sortable: true,
          render: (r) => (
            <div className="flex items-center gap-2.5">
              {r.avatar
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={r.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                : <span className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-bold">{(r.name || '?').charAt(0)}</span>}
              <div className="min-w-0">
                <p className="font-semibold text-dark truncate">{r.name}</p>
                <p className="text-xs text-gray-400 truncate">{[r.position, r.company].filter(Boolean).join(' — ')}</p>
              </div>
            </div>
          ),
        },
        { key: 'content', label: 'الرأي', render: (r) => <span className="text-gray-600 line-clamp-2 max-w-md block">{r.content}</span> },
        {
          key: 'rating',
          label: 'التقييم',
          sortable: true,
          width: '120px',
          render: (r) => (
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < (r.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
              ))}
            </span>
          ),
        },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      fields={[
        { name: 'name', label: 'اسم العميل', required: true },
        { name: 'position', label: 'المسمى الوظيفي' },
        { name: 'company', label: 'الشركة' },
        {
          name: 'rating',
          label: 'التقييم',
          type: 'select',
          options: [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} نجوم` })),
        },
        { name: 'avatar', label: 'صورة العميل', type: 'image', folder: 'testimonials', ratio: 'aspect-square', cols: 2 },
        { name: 'content', label: 'نص الرأي', type: 'textarea', rows: 5, required: true, cols: 2 },
        { name: 'isActive', label: 'مفعّل', type: 'toggle', default: true },
      ]}
      beforeSave={(p) => ({ ...p, rating: Number(p.rating) || 5 })}
    />
  );
}
