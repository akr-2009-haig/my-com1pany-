'use client';

import CrudPage from '../../../../components/admin/crud/CrudPage';
import { ADMIN_BASE } from '../../../../utils/constants';

export default function FaqCategoriesPage() {
  return (
    <CrudPage
      endpoint="/faq-categories"
      module="faq"
      title="تصنيفات الأسئلة الشائعة"
      subtitle="التبويبات التي تُقسَّم عليها الأسئلة في صفحة الأسئلة الشائعة"
      breadcrumb={[{ label: 'الأسئلة الشائعة', href: `${ADMIN_BASE}/faq` }, { label: 'التصنيفات' }]}
      addLabel="إضافة تصنيف"
      reorderable
      modalSize="sm"
      dragTitle={(r) => r.name}
      defaults={{ name: '', isActive: true }}
      columns={[
        { key: 'name', label: 'التصنيف', sortable: true, render: (r) => <span className="font-semibold text-dark">{r.name}</span> },
        { key: 'slug', label: 'الرابط', render: (r) => <code className="text-xs text-gray-500" dir="ltr">{r.slug}</code> },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      fields={[
        { name: 'name', label: 'اسم التصنيف', required: true, cols: 2 },
        { name: 'isActive', label: 'مفعّل', type: 'toggle', default: true },
      ]}
    />
  );
}
