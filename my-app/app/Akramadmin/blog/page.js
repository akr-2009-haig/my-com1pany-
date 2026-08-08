'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Folder, MessageSquare, Tag } from 'lucide-react';
import CrudPage from '../../../components/admin/crud/CrudPage';
import Badge from '../../../components/admin/ui/Badge';
import api from '../../../utils/api';
import { ADMIN_BASE } from '../../../utils/constants';
import { formatDateShort } from '../../../utils/formatDate';

export default function BlogPage() {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    api.get('/post-categories', { params: { limit: 0 } }).then((r) => setCats(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <CrudPage
      endpoint="/posts"
      module="blog"
      title="مقالات المدونة"
      subtitle="إدارة مقالات المدونة، النشر والجدولة والمسودات"
      breadcrumb={[{ label: 'المدونة' }]}
      addLabel="كتابة مقال"
      addHref={`${ADMIN_BASE}/blog/add`}
      editHref={(r) => `${ADMIN_BASE}/blog/edit/${r._id}`}
      toggleField={null}
      exportable
      dragTitle={(r) => r.title}
      filters={[
        {
          key: 'status',
          label: 'كل الحالات',
          options: [
            { value: 'published', label: 'منشور' },
            { value: 'draft', label: 'مسودة' },
            { value: 'scheduled', label: 'مجدول' },
          ],
        },
      ]}
      extraHeaderActions={(
        <>
          <Link href={`${ADMIN_BASE}/blog/categories`} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
            <Folder className="w-4 h-4" /> التصنيفات
          </Link>
          <Link href={`${ADMIN_BASE}/blog/tags`} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
            <Tag className="w-4 h-4" /> الوسوم
          </Link>
          <Link href={`${ADMIN_BASE}/blog/comments`} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
            <MessageSquare className="w-4 h-4" /> التعليقات
          </Link>
        </>
      )}
      columns={[
        {
          key: 'title',
          label: 'المقال',
          sortable: true,
          render: (r) => (
            <div className="flex items-center gap-3">
              {r.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={r.image} alt="" className="w-16 h-11 rounded-lg object-cover border border-gray-100 shrink-0" />
                : <span className="w-16 h-11 rounded-lg bg-gray-100 grid place-items-center text-[10px] text-gray-400 shrink-0">لا صورة</span>}
              <div className="min-w-0">
                <p className="font-semibold text-dark truncate max-w-sm">{r.title}</p>
                <p className="text-xs text-gray-400 truncate max-w-sm">{r.excerpt}</p>
              </div>
            </div>
          ),
        },
        {
          key: 'categories',
          label: 'التصنيفات',
          render: (r) => (
            <div className="flex flex-wrap gap-1">
              {(r.categories || []).slice(0, 2).map((c) => {
                const id = typeof c === 'object' ? c._id : c;
                const name = typeof c === 'object' ? c.name : cats.find((x) => String(x._id) === String(c))?.name;
                return <span key={id} className="badge-blue">{name || '—'}</span>;
              })}
              {!(r.categories || []).length ? <span className="text-gray-300">—</span> : null}
            </div>
          ),
        },
        { key: 'authorName', label: 'الكاتب', render: (r) => <span className="text-gray-600 text-xs">{r.authorName || '—'}</span> },
        { key: 'status', label: 'الحالة', width: '100px', render: (r) => <Badge status={r.status} /> },
        { key: 'views', label: 'مشاهدات', sortable: true, width: '90px', render: (r) => r.views || 0 },
        { key: 'createdAt', label: 'التاريخ', sortable: true, width: '110px', render: (r) => <span className="text-xs text-gray-500">{formatDateShort(r.publishAt || r.createdAt)}</span> },
      ]}
      extraRowActions={(row) => (
        row.slug ? (
          <a href={`/blog/${row.slug}`} target="_blank" rel="noreferrer" title="معاينة" className="w-8 h-8 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary">
            <Eye className="w-4 h-4" />
          </a>
        ) : null
      )}
    />
  );
}
