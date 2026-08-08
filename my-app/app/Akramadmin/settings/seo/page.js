'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';

export default function SeoSettingsPage() {
  return (
    <SettingsSection
      group="seo"
      title="تحسين محركات البحث (SEO)"
      subtitle="العناوين والأوصاف الافتراضية وأكواد التتبع"
      breadcrumbLabel="SEO"
      defaults={{ title: '', description: '', keywords: '', ogImage: '', ga: '', gtm: '', pixel: '', robots: '' }}
      fields={[
        { name: 'title', label: 'عنوان الموقع الافتراضي', cols: 2, hint: '50 - 60 حرفاً' },
        { name: 'description', label: 'الوصف الافتراضي', type: 'textarea', rows: 3, cols: 2, hint: '150 - 160 حرفاً' },
        { name: 'keywords', label: 'الكلمات المفتاحية (مفصولة بفاصلة)', cols: 2 },
        { name: 'ogImage', label: 'صورة المشاركة (Open Graph)', type: 'image', folder: 'seo', cols: 2, uploadHint: 'المقاس المفضل 1200×630' },
        { name: 'ga', label: 'Google Analytics ID', dir: 'ltr', placeholder: 'G-XXXXXXX' },
        { name: 'gtm', label: 'Google Tag Manager ID', dir: 'ltr', placeholder: 'GTM-XXXXXXX' },
        { name: 'pixel', label: 'Facebook Pixel ID', dir: 'ltr' },
        { name: 'robots', label: 'محتوى robots.txt', type: 'textarea', rows: 5, dir: 'ltr', cols: 2 },
      ]}
    />
  );
}
