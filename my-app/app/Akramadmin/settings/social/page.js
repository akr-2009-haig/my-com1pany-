'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';

const NETWORKS = [
  ['facebook', 'فيسبوك'], ['twitter', 'X / تويتر'], ['instagram', 'إنستغرام'],
  ['linkedin', 'لينكدإن'], ['youtube', 'يوتيوب'], ['tiktok', 'تيك توك'],
  ['snapchat', 'سناب شات'], ['pinterest', 'بينتريست'], ['github', 'GitHub'],
];

export default function SocialSettingsPage() {
  return (
    <SettingsSection
      group="socials"
      title="وسائل التواصل الاجتماعي"
      subtitle="الروابط التي تظهر في الشريط العلوي والفوتر — اترك الحقل فارغاً لإخفاء الأيقونة"
      breadcrumbLabel="وسائل التواصل"
      defaults={Object.fromEntries(NETWORKS.map(([k]) => [k, '']))}
      fields={NETWORKS.map(([key, label]) => ({
        name: key, label, dir: 'ltr', placeholder: `https://${key}.com/...`,
      }))}
    />
  );
}
