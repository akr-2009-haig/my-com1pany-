'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import LeadsPage from '../../../../components/admin/crud/LeadsPage';
import DetailGrid from '../../../../components/admin/crud/DetailGrid';
import api from '../../../../utils/api';
import { ADMIN_BASE } from '../../../../utils/constants';
import { formatDate } from '../../../../utils/formatDate';

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    api.get('/jobs', { params: { limit: 0 } }).then((r) => setJobs(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <LeadsPage
      endpoint="/applications"
      module="applications"
      title="طلبات التوظيف"
      subtitle="السير الذاتية المقدَّمة على الوظائف المعلنة"
      breadcrumb={[{ label: 'الوظائف', href: `${ADMIN_BASE}/jobs` }, { label: 'طلبات التوظيف' }]}
      searchPlaceholder="بحث بالاسم أو البريد أو الوظيفة أو المصدر أو الخبرة..."
      emptyText="لا توجد طلبات توظيف"
      statusOptions={[
        { value: 'new', label: 'جديد' },
        { value: 'reviewing', label: 'قيد المراجعة' },
        { value: 'shortlisted', label: 'مقبول مبدئياً' },
        { value: 'interview', label: 'مقابلة' },
        { value: 'accepted', label: 'مقبول' },
        { value: 'rejected', label: 'مرفوض' },
      ]}
      extraFilters={[{ key: 'job', label: 'كل الوظائف', options: jobs.map((j) => ({ value: j._id, label: j.title })) }]}
      columns={[
        {
          key: 'name',
          label: 'المتقدّم',
          render: (r) => (
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold shrink-0">{(r.name || '?').charAt(0)}</span>
              <div className="min-w-0">
                <p className={`truncate ${r.isRead ? 'text-gray-700' : 'font-bold text-dark'}`}>{r.name}</p>
                <p className="text-[11px] text-gray-400 truncate" dir="ltr">{r.email}</p>
              </div>
            </div>
          ),
        },
        { key: 'jobTitle', label: 'الوظيفة', render: (r) => <span className="badge-blue">{r.jobTitle || '—'}</span> },
        { key: 'experience', label: 'الخبرة', width: '130px', render: (r) => (r.experience ? <span className="text-gray-600 text-xs">{r.experience}</span> : <span className="text-gray-300">—</span>) },
        { key: 'source', label: 'المصدر', width: '140px', render: (r) => (r.source ? <span className="text-gray-600 text-xs">{r.source}</span> : <span className="text-gray-300">—</span>) },
        { key: 'phone', label: 'الهاتف', width: '130px', render: (r) => <span dir="ltr" className="text-xs text-gray-600">{r.phone || '—'}</span> },
        {
          key: 'resume',
          label: 'السيرة الذاتية',
          width: '120px',
          render: (r) => (r.resume
            ? <a href={r.resume} target="_blank" rel="noreferrer" className="badge-green hover:bg-green-200"><FileText className="w-3 h-3" /> تحميل</a>
            : <span className="text-gray-300">—</span>),
        },
      ]}
      detailSections={(d) => (
        <>
          <DetailGrid
            items={[
              { label: 'الاسم', value: d.name },
              { label: 'البريد الإلكتروني', value: d.email, dir: 'ltr' },
              { label: 'رقم الهاتف', value: d.phone || '—', dir: 'ltr' },
              { label: 'الوظيفة', value: d.jobTitle || '—' },
              { label: 'مصدر معرفتك بالوظيفة', value: d.source || '—' },
              { label: 'سنوات الخبرة', value: d.experience || '—' },
              { label: 'رابط أعمال / بورتفوليو', value: d.portfolioUrl || '—', dir: 'ltr', full: true },
              { label: 'الرسالة التعريفية', value: d.coverLetter || '—', full: true, pre: true },
              { label: 'تاريخ التقديم', value: formatDate(d.createdAt, { withTime: true }) },
            ]}
          />
          {d.resume ? (
            <a href={d.resume} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
              <FileText className="w-4 h-4" /> فتح السيرة الذاتية {d.resumeName ? `(${d.resumeName})` : ''}
            </a>
          ) : null}
        </>
      )}
    />
  );
}
