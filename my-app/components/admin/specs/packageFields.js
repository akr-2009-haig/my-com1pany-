import { CURRENCIES } from '../../../utils/constants';

export const PACKAGE_DEFAULTS = {
  name: '', nameEn: '', description: '', monthlyPrice: 0, yearlyPrice: 0, currency: 'SAR',
  features: [], isPopular: false, isActive: true, showOnHome: true,
  buttonText: 'اطلب الآن', buttonLink: '', order: 0,
};

/** currency options come from settings (admin-managed). Falls back to CURRENCIES. */
export function packageCurrencyOptions(currencies = null) {
  if (currencies && currencies.length) {
    return currencies.map((c) => ({ value: c.code || c.label, label: `${c.symbol || ''} ${c.label} (${c.code || ''})`.trim() }));
  }
  return CURRENCIES;
}

export const packageGroups = (currencies = null) => [
  {
    label: 'بيانات الباقة',
    fields: [
      { name: 'name', label: 'اسم الباقة', required: true, placeholder: 'الباقة الاحترافية' },
      { name: 'nameEn', label: 'الاسم (EN)', dir: 'ltr' },
      { name: 'description', label: 'وصف مختصر', type: 'textarea', rows: 3, cols: 2 },
      { name: 'monthlyPrice', label: 'السعر الشهري', type: 'number', min: 0 },
      { name: 'yearlyPrice', label: 'السعر السنوي', type: 'number', min: 0 },
      { name: 'currency', label: 'العملة', type: 'select', options: packageCurrencyOptions(currencies) },
      { name: 'order', label: 'الترتيب', type: 'number', min: 0 },
      { name: 'isPopular', label: 'الأكثر طلباً (مميزة)', type: 'toggle' },
      { name: 'isActive', label: 'مفعّلة', type: 'toggle', default: true },
      { name: 'showOnHome', label: 'إظهارها في الصفحة الرئيسية', type: 'toggle', default: true },
    ],
  },
  {
    label: 'المزايا والزر',
    fields: [
      {
        name: 'features',
        label: 'مزايا الباقة',
        type: 'list',
        cols: 2,
        addLabel: 'إضافة ميزة',
        fields: [
          { key: 'text', label: 'الميزة', type: 'text' },
          { key: 'included', label: 'مشمولة في الباقة', type: 'toggle' },
        ],
      },
      { name: 'buttonText', label: 'نص الزر', placeholder: 'اطلب الآن' },
      {
        name: 'buttonLink',
        label: 'رابط الزر (اختياري)',
        dir: 'ltr',
        hint: 'اتركه فارغاً ليفتح نموذج طلب الباقة داخل الموقع',
      },
    ],
  },
];
