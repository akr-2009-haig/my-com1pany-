'use client';

import CrudPage from '../../../components/admin/crud/CrudPage';

export default function TimelinePage() {
  return (
    <CrudPage
      endpoint="/timeline"
      module="timeline"
      title="الجدول الزمني (مسيرتنا)"
      subtitle="محطات الشركة الظاهرة في صفحة «من نحن»"
      breadcrumb={[{ label: 'عن الشركة' }, { label: 'الجدول الزمني' }]}
      addLabel="إضافة محطة"
      reorderable
      modalSize="md"
      dragTitle={(r) => `${r.year} — ${r.title}`}
      defaults={{ year: '', title: '', description: '', isActive: true }}
      columns={[
        { key: 'year', label: 'السنة', sortable: true, width: '100px', render: (r) => <span className="badge-primary">{r.year}</span> },
        { key: 'title', label: 'العنوان', sortable: true, render: (r) => <span className="font-semibold text-dark">{r.title}</span> },
        { key: 'description', label: 'الوصف', render: (r) => <span className="text-gray-500 text-xs line-clamp-2 max-w-md block">{r.description || '—'}</span> },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      fields={[
        { name: 'year', label: 'السنة', required: true, placeholder: '2015' },
        { name: 'title', label: 'العنوان', required: true, placeholder: 'تأسيس الشركة' },
        { name: 'titleEn', label: 'العنوان (EN)', dir: 'ltr', cols: 2 },
        { name: 'description', label: 'الوصف', type: 'textarea', rows: 4, cols: 2 },
        { name: 'isActive', label: 'مفعّلة', type: 'toggle', default: true },
      ]}
    />
  );
}
