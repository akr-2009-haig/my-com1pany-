'use client';

import CrudPage from '../../../../components/admin/crud/CrudPage';
import { ADMIN_BASE } from '../../../../utils/constants';

export default function PostCategoriesPage() {
  return (
    <CrudPage
      endpoint="/post-categories"
      module="blog"
      title="تصنيفات المدونة"
      subtitle="التصنيفات التي تُنظَّم بها مقالات المدونة"
      breadcrumb={[{ label: 'المدونة', href: `${ADMIN_BASE}/blog` }, { label: 'التصنيفات' }]}
      addLabel="إضافة تصنيف"
      reorderable
      modalSize="md"
      dragTitle={(r) => r.name}
      defaults={{ name: '', nameEn: '', description: '', isActive: true }}
      columns={[
        { key: 'name', label: 'التصنيف', sortable: true, render: (r) => <span className="font-semibold text-dark">{r.name}</span> },
        { key: 'slug', label: 'الرابط', render: (r) => <code className="text-xs text-gray-500" dir="ltr">{r.slug}</code> },
        { key: 'description', label: 'الوصف', render: (r) => <span className="text-gray-500 text-xs line-clamp-1">{r.description || '—'}</span> },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      fields={[
        { name: 'name', label: 'اسم التصنيف', required: true },
        { name: 'nameEn', label: 'الاسم (EN)', dir: 'ltr' },
        { name: 'description', label: 'وصف مختصر', type: 'textarea', rows: 3, cols: 2 },
        { name: 'isActive', label: 'مفعّل', type: 'toggle', default: true },
      ]}
    />
  );
}
