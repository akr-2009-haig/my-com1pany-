'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Users } from 'lucide-react';
import CrudPage from '../../../components/admin/crud/CrudPage';
import api from '../../../utils/api';
import { ADMIN_BASE, JOB_TYPES } from '../../../utils/constants';
import { formatDateShort } from '../../../utils/formatDate';

export default function JobsPage() {
  const [departments, setDepartments] = useState([]);
  const [jobTypes, setJobTypes] = useState(JOB_TYPES);
  useEffect(() => {
    api.get('/job-departments', { params: { limit: 0 } }).then((r) => setDepartments(r.data?.data || [])).catch(() => {});
    api.get('/settings').then((r) => {
      const jt = r.data?.dropdowns?.jobTypes;
      if (jt && jt.length) setJobTypes(jt);
    }).catch(() => {});
  }, []);
  const typeLabel = (v) => (jobTypes.find((t) => t.value === v)?.label) || v;

  return (
    <CrudPage
      endpoint="/jobs"
      module="jobs"
      title="الوظائف المتاحة"
      subtitle="الوظائف المعلنة في صفحة الوظائف"
      breadcrumb={[{ label: 'الوظائف' }]}
      addLabel="إضافة وظيفة"
      addHref={`${ADMIN_BASE}/jobs/add`}
      editHref={(r) => `${ADMIN_BASE}/jobs/edit/${r._id}`}
      reorderable
      exportable
      dragTitle={(r) => r.title}
      filters={[
        { key: 'department', label: 'كل الأقسام', options: departments.map((d) => ({ value: d.name, label: d.name })) },
        { key: 'type', label: 'كل الأنواع', options: jobTypes },
      ]}
      extraHeaderActions={(
        <Link href={`${ADMIN_BASE}/jobs/applications`} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
          <Users className="w-4 h-4" /> طلبات التوظيف
        </Link>
      )}
      columns={[
        {
          key: 'title',
          label: 'الوظيفة',
          sortable: true,
          render: (r) => (
            <div className="min-w-0">
              <p className="font-semibold text-dark truncate">{r.title}</p>
              <p className="text-xs text-gray-400 truncate">{r.location || 'غير محدد'}</p>
            </div>
          ),
        },
        { key: 'department', label: 'القسم', render: (r) => <span className="badge-blue">{r.department || '—'}</span> },
        {
          key: 'type',
          label: 'النوع',
          width: '110px',
          render: (r) => <span className="badge-gray">{typeLabel(r.type)}</span>,
        },
        {
          key: 'applicationsCount',
          label: 'المتقدمون',
          sortable: true,
          width: '100px',
          render: (r) => (
            <Link href={`${ADMIN_BASE}/jobs/applications`} className="badge-primary hover:bg-primary hover:text-white">
              {r.applicationsCount || 0}
            </Link>
          ),
        },
        {
          key: 'deadline',
          label: 'آخر موعد',
          sortable: true,
          width: '110px',
          render: (r) => {
            if (!r.deadline) return <span className="text-gray-300">—</span>;
            const expired = new Date(r.deadline) < new Date();
            return <span className={`text-xs ${expired ? 'text-danger font-semibold' : 'text-gray-500'}`}>{formatDateShort(r.deadline)}</span>;
          },
        },
      ]}
      extraRowActions={(row) => (
        row.slug ? (
          <a href={`/careers/${row.slug}`} target="_blank" rel="noreferrer" title="معاينة" className="w-8 h-8 grid place-items-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary">
            <Eye className="w-4 h-4" />
          </a>
        ) : null
      )}
    />
  );
}
