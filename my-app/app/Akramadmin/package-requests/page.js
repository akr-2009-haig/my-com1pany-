'use client';

import LeadsPage from '../../../components/admin/crud/LeadsPage';
import DetailGrid from '../../../components/admin/crud/DetailGrid';
import { formatDate } from '../../../utils/formatDate';

export default function PackageRequestsPage() {
  return (
    <LeadsPage
      endpoint="/package-requests"
      module="packagerequests"
      title="طلبات الباقات"
      subtitle="الطلبات المرسلة من صفحة الأسعار عبر زر «اطلب الآن»"
      breadcrumb={[{ label: 'الطلبات والرسائل' }, { label: 'طلبات الباقات' }]}
      searchPlaceholder="بحث بالاسم أو البريد أو الباقة..."
      emptyText="لا توجد طلبات باقات"
      statusOptions={[
        { value: 'new', label: 'جديد' },
        { value: 'reviewing', label: 'قيد المراجعة' },
        { value: 'completed', label: 'مكتمل' },
        { value: 'rejected', label: 'مرفوض' },
      ]}
      columns={[
        {
          key: 'name',
          label: 'العميل',
          render: (r) => (
            <div className="min-w-0">
              <p className={`truncate ${r.isRead ? 'text-gray-700' : 'font-bold text-dark'}`}>{r.name}</p>
              <p className="text-[11px] text-gray-400 truncate" dir="ltr">{r.email}</p>
            </div>
          ),
        },
        { key: 'packageName', label: 'الباقة', render: (r) => <span className="badge-primary">{r.packageName || '—'}</span> },
        { key: 'billing', label: 'الدورة', width: '100px', render: (r) => <span className="badge-gray">{r.billing === 'yearly' ? 'سنوي' : 'شهري'}</span> },
        { key: 'phone', label: 'الهاتف', width: '130px', render: (r) => <span dir="ltr" className="text-xs text-gray-600">{r.phone || '—'}</span> },
        { key: 'company', label: 'الشركة', render: (r) => <span className="text-xs text-gray-600">{r.company || '—'}</span> },
      ]}
      detailSections={(d) => (
        <DetailGrid
          items={[
            { label: 'الاسم', value: d.name },
            { label: 'البريد الإلكتروني', value: d.email, dir: 'ltr' },
            { label: 'رقم الهاتف', value: d.phone || '—', dir: 'ltr' },
            { label: 'الشركة', value: d.company || '—' },
            { label: 'الباقة المطلوبة', value: d.packageName || '—' },
            { label: 'دورة الاشتراك', value: d.billing === 'yearly' ? 'سنوي' : 'شهري' },
            { label: 'رسالة العميل', value: d.message || '—', full: true, pre: true },
            { label: 'تاريخ الطلب', value: formatDate(d.createdAt, { withTime: true }) },
          ]}
        />
      )}
    />
  );
}
