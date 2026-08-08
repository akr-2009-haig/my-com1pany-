'use client';

import CrudPage from '../../../../components/admin/crud/CrudPage';
import Icon from '../../../../components/shared/Icon';
import { ADMIN_BASE } from '../../../../utils/constants';

export default function ProjectCategoriesPage() {
  return (
    <CrudPage
      endpoint="/project-categories"
      module="portfolio"
      title="تصنيفات المشاريع"
      subtitle="التصنيفات المستخدمة لفلترة معرض الأعمال"
      breadcrumb={[{ label: 'معرض الأعمال', href: `${ADMIN_BASE}/portfolio` }, { label: 'التصنيفات' }]}
      addLabel="إضافة تصنيف"
      reorderable
      modalSize="md"
      dragTitle={(r) => r.name}
      defaults={{ name: '', nameEn: '', description: '', icon: 'Folder', isActive: true }}
      columns={[
        {
          key: 'name',
          label: 'التصنيف',
          sortable: true,
          render: (r) => (
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon name={r.icon} className="w-4.5 h-4.5" /></span>
              <span className="font-semibold text-dark">{r.name}</span>
            </div>
          ),
        },
        { key: 'slug', label: 'الرابط', render: (r) => <code className="text-xs text-gray-500" dir="ltr">{r.slug}</code> },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      fields={[
        { name: 'name', label: 'اسم التصنيف', required: true },
        { name: 'nameEn', label: 'الاسم (EN)', dir: 'ltr' },
        { name: 'icon', label: 'الأيقونة', type: 'icon', cols: 2 },
        { name: 'description', label: 'وصف مختصر', type: 'textarea', rows: 3, cols: 2 },
        { name: 'isActive', label: 'مفعّل', type: 'toggle', default: true },
      ]}
    />
  );
}
