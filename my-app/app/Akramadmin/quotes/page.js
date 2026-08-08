'use client';

import { Paperclip } from 'lucide-react';
import LeadsPage from '../../../components/admin/crud/LeadsPage';
import DetailGrid from '../../../components/admin/crud/DetailGrid';
import { formatDate } from '../../../utils/formatDate';

export default function QuotesPage() {
  return (
    <LeadsPage
      endpoint="/quotes"
      module="quotes"
      title="طلبات عروض الأسعار"
      subtitle="الطلبات الواردة من صفحة «اطلب عرض سعر»"
      breadcrumb={[{ label: 'الطلبات والرسائل' }, { label: 'عروض الأسعار' }]}
      searchPlaceholder="بحث بالاسم أو الشركة أو البريد..."
      emptyText="لا توجد طلبات"
      canReply
      statusOptions={[
        { value: 'new', label: 'جديد' },
        { value: 'reviewing', label: 'قيد المراجعة' },
        { value: 'sent', label: 'تم إرسال عرض' },
        { value: 'completed', label: 'مكتمل' },
        { value: 'rejected', label: 'مرفوض' },
      ]}
      replyDefaults={(d) => ({
        subject: 'عرض السعر الخاص بك',
        body: `مرحباً ${d.name}،\n\nشكراً لتواصلك معنا بخصوص ${d.projectType || 'مشروعك'}.\n\n`,
      })}
      columns={[
        {
          key: 'name',
          label: 'مقدّم الطلب',
          render: (r) => (
            <div className="min-w-0">
              <p className={`truncate ${r.isRead ? 'text-gray-700' : 'font-bold text-dark'}`}>{r.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{r.company || r.email}</p>
            </div>
          ),
        },
        { key: 'projectType', label: 'نوع المشروع', render: (r) => (r.projectType ? <span className="badge-blue">{r.projectType}</span> : <span className="text-gray-300">—</span>) },
        { key: 'budget', label: 'الميزانية', width: '140px', render: (r) => <span className="text-gray-600 text-xs">{r.budget || '—'}</span> },
        { key: 'timeline', label: 'المدة', width: '120px', render: (r) => <span className="text-gray-600 text-xs">{r.timeline || '—'}</span> },
        {
          key: 'attachments',
          label: 'مرفقات',
          width: '80px',
          render: (r) => ((r.attachments || []).length
            ? <span className="badge-gray"><Paperclip className="w-3 h-3" /> {r.attachments.length}</span>
            : <span className="text-gray-300">—</span>),
        },
      ]}
      detailSections={(d) => (
        <>
          <DetailGrid
            items={[
              { label: 'الاسم', value: d.name },
              { label: 'الشركة', value: d.company || '—' },
              { label: 'البريد الإلكتروني', value: d.email, dir: 'ltr' },
              { label: 'رقم الهاتف', value: d.phone || '—', dir: 'ltr' },
              { label: 'نوع المشروع', value: d.projectType || '—' },
              { label: 'الميزانية', value: d.budget || '—' },
              { label: 'الجدول الزمني', value: d.timeline || '—' },
              { label: 'عنوان IP', value: d.ip || '—', dir: 'ltr' },
              { label: 'وصف المشروع', value: d.description || '—', full: true, pre: true },
              { label: 'تاريخ الطلب', value: formatDate(d.createdAt, { withTime: true }) },
            ]}
          />
          {(d.attachments || []).length ? (
            <div>
              <span className="label">الملفات المرفقة</span>
              <div className="flex flex-wrap gap-2">
                {d.attachments.map((a) => (
                  <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-primary hover:text-white">
                    <Paperclip className="w-4 h-4" /> {a.name || 'ملف'}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    />
  );
}
