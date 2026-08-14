import { ADMIN_BASE as B } from '../../../utils/constants';

/**
 * Sidebar structure. Every entry declares the permission module it needs so the
 * sidebar can be filtered per role with `can(user, module)`.
 */
const NAV = [
  { label: 'لوحة المعلومات', href: B, icon: 'LayoutDashboard', module: 'dashboard', exact: true },

  {
    label: 'الصفحة الرئيسية',
    icon: 'Home',
    module: 'homepage',
    children: [
      { label: 'السلايدر الرئيسي', href: `${B}/hero`, module: 'slides' },
      { label: 'شريط الإحصائيات', href: `${B}/stats`, module: 'stats' },
      { label: 'قسم من نحن', href: `${B}/about-section`, module: 'pages' },
      { label: 'لماذا تختارنا', href: `${B}/why-us`, module: 'pages' },
      { label: 'قسم الدعوة للإجراء', href: `${B}/cta`, module: 'pages' },
      { label: 'ترتيب الأقسام', href: `${B}/sections-order`, module: 'homepage' },
    ],
  },

  { label: 'الخدمات', href: `${B}/services`, icon: 'Wrench', module: 'services' },

  {
    label: 'معرض الأعمال',
    icon: 'Briefcase',
    module: 'portfolio',
    children: [
      { label: 'المشاريع', href: `${B}/portfolio`, module: 'portfolio' },
      { label: 'تصنيفات المشاريع', href: `${B}/portfolio/categories`, module: 'portfolio' },
    ],
  },

  { label: 'الباقات والأسعار', href: `${B}/packages`, icon: 'Wallet', module: 'packages' },

  {
    label: 'المدونة',
    icon: 'Newspaper',
    module: 'blog',
    children: [
      { label: 'كل المقالات', href: `${B}/blog`, module: 'blog' },
      { label: 'إضافة مقال', href: `${B}/blog/add`, module: 'blog', action: 'create' },
      { label: 'التصنيفات', href: `${B}/blog/categories`, module: 'blog' },
      { label: 'الوسوم', href: `${B}/blog/tags`, module: 'blog' },
      { label: 'التعليقات', href: `${B}/blog/comments`, module: 'comments', badge: 'comments' },
    ],
  },

  {
    label: 'الطلبات والرسائل',
    icon: 'Inbox',
    module: 'messages',
    badge: 'leads',
    children: [
      { label: 'رسائل التواصل', href: `${B}/messages`, module: 'messages', badge: 'messages' },
      { label: 'عروض الأسعار', href: `${B}/quotes`, module: 'quotes', badge: 'quotes' },
      { label: 'طلبات الباقات', href: `${B}/package-requests`, module: 'packagerequests', badge: 'packageRequests' },
      { label: 'طلبات التوظيف', href: `${B}/jobs/applications`, module: 'applications', badge: 'applications' },
    ],
  },

  {
    label: 'العملاء والشركاء',
    icon: 'Handshake',
    module: 'partners',
    children: [
      { label: 'الشركاء', href: `${B}/partners`, module: 'partners' },
      { label: 'آراء العملاء', href: `${B}/testimonials`, module: 'testimonials' },
    ],
  },

  {
    label: 'عن الشركة',
    icon: 'Building2',
    module: 'team',
    children: [
      { label: 'فريق العمل', href: `${B}/team`, module: 'team' },
      { label: 'الجدول الزمني', href: `${B}/timeline`, module: 'timeline' },
      { label: 'الشهادات والاعتمادات', href: `${B}/certificates`, module: 'pages' },
      { label: 'الرؤية والرسالة', href: `${B}/vision-mission`, module: 'pages' },
      { label: 'محتوى صفحة من نحن', href: `${B}/about-page`, module: 'pages' },
    ],
  },

  {
    label: 'الوظائف',
    icon: 'Users',
    module: 'jobs',
    children: [
      { label: 'الوظائف المتاحة', href: `${B}/jobs`, module: 'jobs' },
      { label: 'طلبات التوظيف', href: `${B}/jobs/applications`, module: 'applications' },
      { label: 'إعدادات نموذج التقديم', href: `${B}/jobs/settings`, module: 'settings' },
      { label: 'ثقافة العمل', href: `${B}/pages/careers`, module: 'pages' },
    ],
  },

  {
    label: 'الصفحات والنماذج',
    icon: 'FileText',
    module: 'pages',
    children: [
      { label: 'صفحة تواصل معنا', href: `${B}/pages/contact`, module: 'pages' },
      { label: 'صفحة طلب عرض سعر', href: `${B}/pages/quote`, module: 'pages' },
      { label: 'الأسئلة الشائعة', href: `${B}/faq`, module: 'faq' },
      { label: 'تصنيفات الأسئلة', href: `${B}/faq/categories`, module: 'faq' },
      { label: 'سياسة الخصوصية', href: `${B}/pages/privacy`, module: 'pages' },
      { label: 'الشروط والأحكام', href: `${B}/pages/terms`, module: 'pages' },
      { label: 'صفحة 404', href: `${B}/pages/notfound`, module: 'pages' },
    ],
  },

  { label: 'القوائم', href: `${B}/menus`, icon: 'List', module: 'menus' },
  { label: 'بانرات الصفحات', href: `${B}/banners`, icon: 'ImageIcon', module: 'banners' },

  {
    label: 'الإعدادات',
    icon: 'Settings',
    module: 'settings',
    children: [
      { label: 'معلومات الشركة', href: `${B}/settings`, module: 'settings', exact: true },
      { label: 'بيانات التواصل', href: `${B}/settings/contact`, module: 'settings' },
      { label: 'وسائل التواصل', href: `${B}/settings/social`, module: 'settings' },
      { label: 'تحسين محركات البحث', href: `${B}/settings/seo`, module: 'settings' },
      { label: 'إعدادات البريد', href: `${B}/settings/smtp`, module: 'settings' },
      { label: 'التنبيهات', href: `${B}/settings/notifications`, module: 'settings' },
      { label: 'زر واتساب', href: `${B}/settings/whatsapp`, module: 'settings' },
      { label: 'اللغات', href: `${B}/settings/languages`, module: 'settings' },
      { label: 'العملات المتاحة', href: `${B}/settings/currencies`, module: 'settings' },
      { label: 'أنواع الدوام', href: `${B}/settings/job-types`, module: 'settings' },
      { label: 'أقسام الشركة', href: `${B}/settings/departments`, module: 'settings' },
      { label: 'الأمان', href: `${B}/settings/security`, module: 'settings' },
      { label: 'وضع الصيانة', href: `${B}/settings/maintenance`, module: 'settings' },
    ],
  },

  {
    label: 'المستخدمون والصلاحيات',
    icon: 'Shield',
    module: 'users',
    children: [
      { label: 'المستخدمون', href: `${B}/users`, module: 'users' },
      { label: 'الأدوار والصلاحيات', href: `${B}/users/roles`, module: 'roles' },
      { label: 'سجل النشاطات', href: `${B}/activity-log`, module: 'activity' },
    ],
  },

  { label: 'التقارير والإحصائيات', href: `${B}/analytics`, icon: 'BarChart3', module: 'analytics' },

  {
    label: 'الأمان والنسخ',
    icon: 'Lock',
    module: 'security',
    children: [
      { label: 'سجل الدخول و IP', href: `${B}/security`, module: 'security' },
      { label: 'النسخ الاحتياطي', href: `${B}/backup`, module: 'backup' },
    ],
  },
];

export default NAV;
