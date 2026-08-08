/**
 * Central permission catalogue. Shared by the API (authorisation middleware)
 * and by the admin UI (permission matrix + sidebar filtering).
 */

const ACTIONS = ['view', 'create', 'edit', 'delete', 'toggle'];

const MODULES = [
  { key: 'dashboard', label: 'لوحة المعلومات', actions: ['view'] },
  { key: 'homepage', label: 'إدارة الصفحة الرئيسية', actions: ['view', 'edit', 'toggle'] },
  { key: 'slides', label: 'السلايدر', actions: ACTIONS },
  { key: 'stats', label: 'الإحصائيات', actions: ACTIONS },
  { key: 'services', label: 'الخدمات', actions: ACTIONS },
  { key: 'portfolio', label: 'معرض الأعمال', actions: ACTIONS },
  { key: 'packages', label: 'الباقات', actions: ACTIONS },
  { key: 'blog', label: 'المدونة', actions: ACTIONS },
  { key: 'comments', label: 'التعليقات', actions: ['view', 'edit', 'delete'] },
  { key: 'messages', label: 'رسائل التواصل', actions: ['view', 'edit', 'delete'] },
  { key: 'quotes', label: 'طلبات عروض الأسعار', actions: ['view', 'edit', 'delete'] },
  { key: 'packagerequests', label: 'طلبات الباقات', actions: ['view', 'edit', 'delete'] },
  { key: 'applications', label: 'طلبات التوظيف', actions: ['view', 'edit', 'delete'] },
  { key: 'jobs', label: 'الوظائف', actions: ACTIONS },
  { key: 'team', label: 'فريق العمل', actions: ACTIONS },
  { key: 'partners', label: 'الشركاء', actions: ACTIONS },
  { key: 'testimonials', label: 'آراء العملاء', actions: ACTIONS },
  { key: 'timeline', label: 'الجدول الزمني', actions: ACTIONS },
  { key: 'faq', label: 'الأسئلة الشائعة', actions: ACTIONS },
  { key: 'menus', label: 'القوائم', actions: ACTIONS },
  { key: 'banners', label: 'بانرات الصفحات', actions: ['view', 'edit'] },
  { key: 'pages', label: 'الصفحات', actions: ['view', 'edit'] },
  { key: 'settings', label: 'الإعدادات', actions: ['view', 'edit'] },
  { key: 'users', label: 'المستخدمين', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'roles', label: 'الأدوار والصلاحيات', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'analytics', label: 'التقارير', actions: ['view'] },
  { key: 'security', label: 'الأمان', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'backup', label: 'النسخ الاحتياطي', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'activity', label: 'سجل النشاطات', actions: ['view'] },
];

function fullPermissions(value = true) {
  const out = {};
  MODULES.forEach((m) => {
    out[m.key] = {};
    m.actions.forEach((a) => { out[m.key][a] = value; });
  });
  return out;
}

function permissionsFor(list, actions = ACTIONS) {
  const out = fullPermissions(false);
  list.forEach((key) => {
    if (!out[key]) return;
    const mod = MODULES.find((m) => m.key === key);
    (mod ? mod.actions : actions).forEach((a) => { if (actions.includes(a)) out[key][a] = true; });
  });
  out.dashboard = { view: true };
  return out;
}

const DEFAULT_ROLES = [
  {
    name: 'مدير عام', slug: 'admin', isSystem: true,
    description: 'صلاحيات كاملة على كل أقسام لوحة التحكم',
    permissions: fullPermissions(true),
  },
  {
    name: 'محرر', slug: 'editor', isSystem: true,
    description: 'إدارة المحتوى: الخدمات والمشاريع والمدونة والباقات',
    permissions: permissionsFor(
      ['homepage', 'slides', 'stats', 'services', 'portfolio', 'packages', 'blog', 'comments', 'faq', 'team', 'partners', 'testimonials', 'timeline', 'banners', 'pages'],
      ['view', 'create', 'edit', 'toggle'],
    ),
  },
  {
    name: 'مشرف محتوى', slug: 'moderator', isSystem: true,
    description: 'متابعة الطلبات والرسائل والتعليقات',
    permissions: permissionsFor(
      ['messages', 'quotes', 'packagerequests', 'applications', 'comments', 'jobs', 'analytics'],
      ['view', 'edit', 'delete'],
    ),
  },
  {
    name: 'مشاهد فقط', slug: 'viewer', isSystem: true,
    description: 'عرض البيانات دون تعديل',
    permissions: permissionsFor(MODULES.map((m) => m.key), ['view']),
  },
];

function can(user, moduleKey, action = 'view') {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const p = user.permissions || {};
  return Boolean(p[moduleKey] && p[moduleKey][action]);
}

module.exports = { ACTIONS, MODULES, DEFAULT_ROLES, fullPermissions, permissionsFor, can };
