'use client';

import CrudPage from '../../../../components/admin/crud/CrudPage';
import { ADMIN_BASE } from '../../../../utils/constants';

export default function TagsPage() {
  return (
    <CrudPage
      endpoint="/tags"
      module="blog"
      title="وسوم المدونة"
      subtitle="الكلمات الدلالية المرتبطة بالمقالات"
      breadcrumb={[{ label: 'المدونة', href: `${ADMIN_BASE}/blog` }, { label: 'الوسوم' }]}
      addLabel="إضافة وسم"
      toggleField={null}
      modalSize="sm"
      dragTitle={(r) => r.name}
      defaults={{ name: '' }}
      columns={[
        { key: 'name', label: 'الوسم', sortable: true, render: (r) => <span className="badge-primary">{r.name}</span> },
        { key: 'slug', label: 'الرابط', render: (r) => <code className="text-xs text-gray-500" dir="ltr">{r.slug}</code> },
      ]}
      fields={[{ name: 'name', label: 'اسم الوسم', required: true, cols: 2 }]}
    />
  );
}
