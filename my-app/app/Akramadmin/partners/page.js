'use client';

import CrudPage from '../../../components/admin/crud/CrudPage';

export default function PartnersPage() {
  return (
    <CrudPage
      endpoint="/partners"
      module="partners"
      title="الشركاء والعملاء"
      subtitle="شعارات الشركاء الظاهرة في شريط العملاء بالصفحة الرئيسية"
      breadcrumb={[{ label: 'العملاء والشركاء' }, { label: 'الشركاء' }]}
      addLabel="إضافة شريك"
      reorderable
      modalSize="md"
      dragTitle={(r) => r.name}
      defaults={{ name: '', logo: '', url: '', isActive: true }}
      columns={[
        {
          key: 'logo',
          label: 'الشعار',
          width: '110px',
          render: (r) => (r.logo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={r.logo} alt="" className="w-24 h-12 object-contain bg-gray-50 rounded-lg border border-gray-100 p-1" />
            : <span className="w-24 h-12 rounded-lg bg-gray-100 grid place-items-center text-[10px] text-gray-400">لا شعار</span>),
        },
        { key: 'name', label: 'اسم الشريك', sortable: true, render: (r) => <span className="font-semibold text-dark">{r.name}</span> },
        {
          key: 'url',
          label: 'الموقع',
          render: (r) => (r.url
            ? <a href={r.url} target="_blank" rel="noreferrer" className="text-primary text-xs hover:underline" dir="ltr">{r.url}</a>
            : <span className="text-gray-300">—</span>),
        },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      fields={[
        { name: 'name', label: 'اسم الشريك', required: true, cols: 2 },
        { name: 'logo', label: 'شعار الشريك', type: 'image', folder: 'partners', ratio: 'aspect-[3/2]', cols: 2 },
        { name: 'url', label: 'رابط الموقع', dir: 'ltr', placeholder: 'https://', cols: 2 },
        { name: 'isActive', label: 'مفعّل', type: 'toggle', default: true },
      ]}
    />
  );
}
