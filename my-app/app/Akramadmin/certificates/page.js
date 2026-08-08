'use client';

import CrudPage from '../../../components/admin/crud/CrudPage';

export default function CertificatesPage() {
  return (
    <CrudPage
      endpoint="/certificates"
      module="pages"
      title="الشهادات والاعتمادات"
      subtitle="الشهادات المعروضة في صفحة «من نحن»"
      breadcrumb={[{ label: 'عن الشركة' }, { label: 'الشهادات' }]}
      addLabel="إضافة شهادة"
      reorderable
      toggleField="isActive"
      modalSize="md"
      dragTitle={(r) => r.title}
      defaults={{ title: '', image: '', issuer: '', isActive: true }}
      columns={[
        {
          key: 'image',
          label: 'الصورة',
          width: '110px',
          render: (r) => (r.image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={r.image} alt="" className="w-20 h-14 object-contain bg-gray-50 rounded-lg border border-gray-100 p-1" />
            : <span className="w-20 h-14 rounded-lg bg-gray-100 grid place-items-center text-[10px] text-gray-400">لا صورة</span>),
        },
        { key: 'title', label: 'اسم الشهادة', sortable: true, render: (r) => <span className="font-semibold text-dark">{r.title}</span> },
        { key: 'issuer', label: 'الجهة المانحة', render: (r) => <span className="text-gray-500">{r.issuer || '—'}</span> },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      fields={[
        { name: 'title', label: 'اسم الشهادة', required: true },
        { name: 'issuer', label: 'الجهة المانحة' },
        { name: 'image', label: 'صورة الشهادة', type: 'image', folder: 'certificates', cols: 2 },
        { name: 'isActive', label: 'مفعّلة', type: 'toggle', default: true },
      ]}
    />
  );
}
