'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';
import DynamicList from '../../../../components/admin/ui/DynamicList';

export default function CurrenciesSettingsPage() {
  return (
    <SettingsSection
      group="dropdowns"
      title="العملات المتاحة"
      subtitle="العملات التي تظهر في نموذج الباقات والأسعار. أضف/عدّل/حذف/رتّب بحرية."
      breadcrumbLabel="العملات المتاحة"
      fields={[
        {
          name: 'currencies',
          label: 'العملات',
          type: 'custom',
          cols: 2,
          render: ({ value, set }) => (
            <DynamicList
              label="العملات المتاحة"
              value={value || []}
              addLabel="+ إضافة عملة"
              emptyText="لا توجد عملات بعد."
              fields={[
                { key: 'symbol', label: 'الرمز', type: 'text', placeholder: '$' },
                { key: 'label', label: 'الاسم', type: 'text', placeholder: 'دولار أمريكي' },
                { key: 'code', label: 'الكود', type: 'text', placeholder: 'USD' },
                { key: 'default', label: 'افتراضية', type: 'toggle' },
              ]}
              onChange={set}
            />
          ),
        },
      ]}
      defaults={{
        currencies: [
          { symbol: '$', label: 'دولار أمريكي', code: 'USD' },
          { symbol: 'ر.س', label: 'ريال سعودي', code: 'SAR', default: true },
          { symbol: 'د.إ', label: 'درهم إماراتي', code: 'AED' },
          { symbol: 'ج.م', label: 'جنيه مصري', code: 'EGP' },
          { symbol: 'د.ك', label: 'دينار كويتي', code: 'KWD' },
          { symbol: '€', label: 'يورو', code: 'EUR' },
          { symbol: '£', label: 'جنيه إسترليني', code: 'GBP' },
        ],
      }}
    />
  );
}
