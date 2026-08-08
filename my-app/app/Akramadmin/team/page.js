'use client';

import CrudPage from '../../../components/admin/crud/CrudPage';

export default function TeamPage() {
  return (
    <CrudPage
      endpoint="/team"
      module="team"
      title="فريق العمل"
      subtitle="أعضاء الفريق الظاهرون في صفحة «من نحن»"
      breadcrumb={[{ label: 'عن الشركة' }, { label: 'فريق العمل' }]}
      addLabel="إضافة عضو"
      reorderable
      modalSize="lg"
      dragTitle={(r) => r.name}
      defaults={{ name: '', position: '', bio: '', avatar: '', linkedin: '', twitter: '', email: '', isActive: true }}
      columns={[
        {
          key: 'name',
          label: 'العضو',
          sortable: true,
          render: (r) => (
            <div className="flex items-center gap-2.5">
              {r.avatar
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={r.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                : <span className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-bold">{(r.name || '?').charAt(0)}</span>}
              <div className="min-w-0">
                <p className="font-semibold text-dark truncate">{r.name}</p>
                <p className="text-xs text-gray-400 truncate">{r.position}</p>
              </div>
            </div>
          ),
        },
        { key: 'email', label: 'البريد', render: (r) => <span dir="ltr" className="text-xs text-gray-600">{r.email || '—'}</span> },
        { key: 'bio', label: 'نبذة', render: (r) => <span className="text-gray-500 text-xs line-clamp-2 max-w-sm block">{r.bio || '—'}</span> },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      fields={[
        { name: 'name', label: 'الاسم', required: true },
        { name: 'position', label: 'المسمى الوظيفي', required: true },
        { name: 'nameEn', label: 'الاسم (EN)', dir: 'ltr' },
        { name: 'positionEn', label: 'المسمى (EN)', dir: 'ltr' },
        { name: 'avatar', label: 'الصورة الشخصية', type: 'image', folder: 'team', ratio: 'aspect-square', cols: 2 },
        { name: 'bio', label: 'نبذة مختصرة', type: 'textarea', rows: 4, cols: 2 },
        { name: 'email', label: 'البريد الإلكتروني', type: 'email', dir: 'ltr' },
        { name: 'linkedin', label: 'رابط LinkedIn', dir: 'ltr', placeholder: 'https://linkedin.com/in/...' },
        { name: 'twitter', label: 'رابط X / Twitter', dir: 'ltr', placeholder: 'https://x.com/...' },
        { name: 'isActive', label: 'مفعّل', type: 'toggle', default: true },
      ]}
    />
  );
}
