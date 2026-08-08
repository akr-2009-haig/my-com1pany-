'use client';

import { Eye } from 'lucide-react';
import CrudPage from '../../../components/admin/crud/CrudPage';
import Icon from '../../../components/shared/Icon';
import Badge from '../../../components/admin/ui/Badge';
import { ADMIN_BASE } from '../../../utils/constants';

export default function ServicesPage() {
  return (
    <CrudPage
      endpoint="/services"
      module="services"
      title="إدارة الخدمات"
      subtitle="الخدمات المعروضة على الموقع وصفحات التفاصيل الخاصة بها"
      breadcrumb={[{ label: 'الخدمات' }]}
      addLabel="إضافة خدمة"
      addHref={`${ADMIN_BASE}/services/add`}
      editHref={(r) => `${ADMIN_BASE}/services/edit/${r._id}`}
      reorderable
      exportable
      dragTitle={(r) => r.title}
      filters={[
        { key: 'status', label: 'كل الحالات', options: [{ value: 'published', label: 'منشور' }, { value: 'draft', label: 'مسودة' }] },
        { key: 'isFeatured', label: 'الكل', options: [{ value: 'true', label: 'المميزة فقط' }, { value: 'false', label: 'غير المميزة' }] },
      ]}
      columns={[
        {
          key: 'title',
          label: 'الخدمة',
          sortable: true,
          render: (r) => (
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <Icon name={r.icon} className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-dark truncate">{r.title}</p>
                <p className="text-xs text-gray-400 truncate max-w-xs">{r.shortDesc}</p>
              </div>
            </div>
          ),
        },
        { key: 'status', label: 'النشر', width: '110px', render: (r) => <Badge status={r.status} /> },
        {
          key: 'isFeatured',
          label: 'مميزة',
          width: '80px',
          render: (r) => (r.isFeatured ? <span className="badge-orange">مميزة</span> : <span className="text-gray-300">—</span>),
        },
        { key: 'views', label: 'المشاهدات', sortable: true, width: '100px', render: (r) => <span className="text-gray-500">{r.views || 0}</span> },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      extraRowActions={(row) => (
        row.slug ? (
          <a href={`/services/${row.slug}`} target="_blank" rel="noreferrer" title="معاينة" className="w-8 h-8 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary">
            <Eye className="w-4 h-4" />
          </a>
        ) : null
      )}
    />
  );
}
