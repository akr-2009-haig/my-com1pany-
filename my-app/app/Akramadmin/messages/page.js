'use client';

import LeadsPage from '../../../components/admin/crud/LeadsPage';
import DetailGrid from '../../../components/admin/crud/DetailGrid';
import { formatDate } from '../../../utils/formatDate';

export default function MessagesPage() {
  return (
    <LeadsPage
      endpoint="/messages"
      module="messages"
      title="رسائل التواصل"
      subtitle="الرسائل الواردة من نموذج «تواصل معنا»"
      breadcrumb={[{ label: 'الطلبات والرسائل' }, { label: 'رسائل التواصل' }]}
      searchPlaceholder="بحث بالاسم أو البريد أو نص الرسالة..."
      emptyText="لا توجد رسائل"
      canReply
      statusOptions={[
        { value: 'new', label: 'جديد' },
        { value: 'read', label: 'مقروء' },
        { value: 'replied', label: 'تم الرد' },
        { value: 'archived', label: 'مؤرشف' },
      ]}
      replyDefaults={(d) => ({ subject: `رد على رسالتك${d.subject ? `: ${d.subject}` : ''}`, body: `مرحباً ${d.name}،\n\n` })}
      columns={[
        {
          key: 'name',
          label: 'المرسل',
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
        { key: 'phone', label: 'الهاتف', width: '130px', render: (r) => <span dir="ltr" className="text-xs text-gray-600">{r.phone || '—'}</span> },
        { key: 'service', label: 'الخدمة', render: (r) => (r.service ? <span className="badge-blue">{r.service}</span> : <span className="text-gray-300">—</span>) },
        { key: 'message', label: 'الرسالة', render: (r) => <span className="text-gray-600 line-clamp-2 max-w-sm block">{r.subject ? <b className="text-dark">{r.subject} — </b> : null}{r.message}</span> },
      ]}
      detailSections={(d) => (
        <DetailGrid
          items={[
            { label: 'الاسم', value: d.name },
            { label: 'البريد الإلكتروني', value: d.email, dir: 'ltr' },
            { label: 'رقم الهاتف', value: d.phone || '—', dir: 'ltr' },
            { label: 'الخدمة المطلوبة', value: d.service || '—' },
            { label: 'الموضوع', value: d.subject || '—', full: true },
            { label: 'نص الرسالة', value: d.message, full: true, pre: true },
            { label: 'عنوان IP', value: d.ip || '—', dir: 'ltr' },
            { label: 'تاريخ الإرسال', value: formatDate(d.createdAt, { withTime: true }) },
          ]}
        />
      )}
    />
  );
}
