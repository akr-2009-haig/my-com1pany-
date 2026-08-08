'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Folder } from 'lucide-react';
import CrudPage from '../../../components/admin/crud/CrudPage';
import Badge from '../../../components/admin/ui/Badge';
import api from '../../../utils/api';
import { ADMIN_BASE } from '../../../utils/constants';
import { formatDateShort } from '../../../utils/formatDate';

export default function PortfolioPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/project-categories', { params: { limit: 0 } })
      .then((r) => setCategories(r.data?.data || []))
      .catch(() => {});
  }, []);

  const catName = (c) => {
    if (!c) return '—';
    if (typeof c === 'object') return c.name || '—';
    return categories.find((x) => String(x._id) === String(c))?.name || '—';
  };

  return (
    <CrudPage
      endpoint="/projects"
      module="portfolio"
      title="معرض الأعمال"
      subtitle="المشاريع المنفّذة التي تظهر في صفحة الأعمال"
      breadcrumb={[{ label: 'معرض الأعمال' }]}
      addLabel="إضافة مشروع"
      addHref={`${ADMIN_BASE}/portfolio/add`}
      editHref={(r) => `${ADMIN_BASE}/portfolio/edit/${r._id}`}
      reorderable
      exportable
      dragTitle={(r) => r.title}
      filters={[
        { key: 'category', label: 'كل التصنيفات', options: categories.map((c) => ({ value: c._id, label: c.name })) },
        { key: 'status', label: 'كل الحالات', options: [{ value: 'published', label: 'منشور' }, { value: 'draft', label: 'مسودة' }] },
      ]}
      extraHeaderActions={(
        <Link href={`${ADMIN_BASE}/portfolio/categories`} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
          <Folder className="w-4 h-4" /> التصنيفات
        </Link>
      )}
      columns={[
        {
          key: 'title',
          label: 'المشروع',
          sortable: true,
          render: (r) => (
            <div className="flex items-center gap-3">
              {r.cover
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={r.cover} alt="" className="w-16 h-11 rounded-lg object-cover border border-gray-100 shrink-0" />
                : <span className="w-16 h-11 rounded-lg bg-gray-100 grid place-items-center text-[10px] text-gray-400 shrink-0">لا صورة</span>}
              <div className="min-w-0">
                <p className="font-semibold text-dark truncate">{r.title}</p>
                <p className="text-xs text-gray-400 truncate">{r.client || 'بدون عميل محدد'}</p>
              </div>
            </div>
          ),
        },
        { key: 'category', label: 'التصنيف', render: (r) => <span className="badge-blue">{catName(r.category)}</span> },
        { key: 'projectDate', label: 'التاريخ', sortable: true, width: '110px', render: (r) => <span className="text-gray-500 text-xs">{formatDateShort(r.projectDate) || '—'}</span> },
        { key: 'status', label: 'النشر', width: '100px', render: (r) => <Badge status={r.status} /> },
        { key: 'views', label: 'مشاهدات', sortable: true, width: '90px', render: (r) => r.views || 0 },
      ]}
      extraRowActions={(row) => (
        row.slug ? (
          <a href={`/portfolio/${row.slug}`} target="_blank" rel="noreferrer" title="معاينة" className="w-8 h-8 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary">
            <Eye className="w-4 h-4" />
          </a>
        ) : null
      )}
    />
  );
}
