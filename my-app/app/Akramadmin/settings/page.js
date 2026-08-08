'use client';

import Link from 'next/link';
import SettingsSection from '../../../components/admin/crud/SettingsSection';
import Icon from '../../../components/shared/Icon';
import { ADMIN_BASE } from '../../../utils/constants';

const SHORTCUTS = [
  { label: 'بيانات التواصل', href: `${ADMIN_BASE}/settings/contact`, icon: 'Phone' },
  { label: 'وسائل التواصل', href: `${ADMIN_BASE}/settings/social`, icon: 'Share2' },
  { label: 'محركات البحث', href: `${ADMIN_BASE}/settings/seo`, icon: 'Search' },
  { label: 'إعدادات البريد', href: `${ADMIN_BASE}/settings/smtp`, icon: 'Mail' },
  { label: 'التنبيهات', href: `${ADMIN_BASE}/settings/notifications`, icon: 'Bell' },
  { label: 'زر واتساب', href: `${ADMIN_BASE}/settings/whatsapp`, icon: 'MessageCircle' },
  { label: 'اللغات', href: `${ADMIN_BASE}/settings/languages`, icon: 'Globe' },
  { label: 'الأمان', href: `${ADMIN_BASE}/settings/security`, icon: 'Shield' },
  { label: 'وضع الصيانة', href: `${ADMIN_BASE}/settings/maintenance`, icon: 'Wrench' },
];

export default function CompanySettingsPage() {
  return (
    <SettingsSection
      group={null}
      title="معلومات الشركة"
      subtitle="الاسم والشعار والوصف العام الذي يظهر في الموقع ومحركات البحث"
      breadcrumbLabel="معلومات الشركة"
      defaults={{
        siteName: '', siteNameEn: '', logo: '', logoLight: '', favicon: '',
        description: '', descriptionEn: '', foundedYear: '', copyrightText: '', companyProfile: '', topBarEnabled: true,
      }}
      fields={[
        { name: 'siteName', label: 'اسم الشركة', required: true },
        { name: 'siteNameEn', label: 'اسم الشركة (EN)', dir: 'ltr' },
        { name: 'description', label: 'وصف الشركة', type: 'textarea', rows: 4, cols: 2 },
        { name: 'descriptionEn', label: 'الوصف (EN)', type: 'textarea', rows: 3, dir: 'ltr', cols: 2 },
        { name: 'logo', label: 'الشعار الأساسي', type: 'image', folder: 'brand', ratio: 'aspect-[3/1]' },
        { name: 'logoLight', label: 'الشعار الفاتح (للخلفيات الداكنة)', type: 'image', folder: 'brand', ratio: 'aspect-[3/1]' },
        { name: 'favicon', label: 'أيقونة الموقع (Favicon)', type: 'image', folder: 'brand', ratio: 'aspect-square' },
        { name: 'companyProfile', label: 'ملف تعريفي (PDF) — الرابط', dir: 'ltr', hint: 'ارفع الملف ثم ضع رابطه هنا' },
        { name: 'foundedYear', label: 'سنة التأسيس', placeholder: '2015' },
        { name: 'copyrightText', label: 'نص حقوق النشر', placeholder: 'جميع الحقوق محفوظة' },
        { name: 'topBarEnabled', label: 'إظهار الشريط العلوي', type: 'toggle', default: true },
      ]}
      extra={(
        <div className="admin-card p-5">
          <h3 className="font-bold text-dark mb-4">أقسام الإعدادات</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SHORTCUTS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/60 py-4 text-center hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon name={s.icon} className="w-5 h-5" /></span>
                <span className="text-xs font-semibold text-gray-700">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    />
  );
}
