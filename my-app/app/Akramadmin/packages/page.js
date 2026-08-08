'use client';

import CrudPage from '../../../components/admin/crud/CrudPage';
import { ADMIN_BASE } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatDate';

export default function PackagesPage() {
  return (
    <CrudPage
      endpoint="/packages"
      module="packages"
      title="الباقات والأسعار"
      subtitle="باقات الأسعار المعروضة في صفحة الأسعار والصفحة الرئيسية"
      breadcrumb={[{ label: 'الباقات' }]}
      addLabel="إضافة باقة"
      addHref={`${ADMIN_BASE}/packages/add`}
      editHref={(r) => `${ADMIN_BASE}/packages/edit/${r._id}`}
      reorderable
      dragTitle={(r) => r.name}
      columns={[
        {
          key: 'name',
          label: 'الباقة',
          sortable: true,
          render: (r) => (
            <div>
              <p className="font-semibold text-dark flex items-center gap-2">
                {r.name}
                {r.isPopular ? <span className="badge-orange">الأكثر طلباً</span> : null}
              </p>
              <p className="text-xs text-gray-400 line-clamp-1 max-w-sm">{r.description}</p>
            </div>
          ),
        },
        { key: 'monthlyPrice', label: 'شهري', sortable: true, width: '130px', render: (r) => <span className="font-bold text-primary">{formatCurrency(r.monthlyPrice, r.currency)}</span> },
        { key: 'yearlyPrice', label: 'سنوي', sortable: true, width: '130px', render: (r) => <span className="text-gray-600">{formatCurrency(r.yearlyPrice, r.currency)}</span> },
        { key: 'features', label: 'المزايا', width: '90px', render: (r) => <span className="badge-gray">{(r.features || []).length} ميزة</span> },
        { key: 'showOnHome', label: 'بالرئيسية', width: '90px', render: (r) => (r.showOnHome ? <span className="badge-green">نعم</span> : <span className="badge-gray">لا</span>) },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
    />
  );
}
