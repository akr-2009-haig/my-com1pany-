# 📘 الوثيقة الشاملة الموحّدة — تصميم وتجربة استخدام منصة MyCompany

> **الهدف:** مرجع واحد نهائي يدمج (التصميم المرئي + رحلة الاستخدام + حالات الشاشة + السلوك المتجاوب) بحيث يمكن لأي مطوّر أو مصمّم بناء واختبار المنصة كاملة **دون أي تخمين**.
> **المنهج:** وُثّق كل ملف فعلياً في المشروع (`app/`, `components/`, `lib/schemas.js`, `routes/`, `controllers/`, `tailwind.config.js`, `globals.css`, `middleware/`).
> **منهجية العرض لكل شاشة:** 📐 التخطيط → 🎨 المرئي → 🖱️ التفاعل → 📱 المتجاوب → ⚡ اللحظي → 🔄 الديناميكي → 🧭 رحلة الاستخدام والحالات.

---

# 🎨 الجزء 0 — نظام التصميم العام (Design System)

## 0.1 الألوان

| الاسم | HEX | الاستخدام |
|---|---|---|
| Primary (سماوي) | `#00BCD4` | الأزرار الرئيسية، الروابط النشطة، الفواصل، التبديلات المفعلة |
| Primary Dark | `#00ACC1` | hover للأزرار السماوية |
| Primary Light | `#E0F7FA` | خلفيات الأيقونات والتلميحات |
| Primary 100/200/700 | `#B2EBF2`/`#80DEEA`/`#0097A7` | درجات وسيطة للـ badges |
| Dark | `#1a1a2e` | الفوتر، Sidebar الأدمن، خلفية الدخول |
| Darker | `#12121f` | شريط الحقوق |
| Soft | `#f5f7fa` | خلفية الأقسام المتناوبة |
| Admin BG | `#f0f2f5` | خلفية اللوحة |
| Danger | `#e74c3c` | الحذف/الأخطاء |
| Muted | `#6c757d` | الإلغاء |
| Success | `#22c55e` | النجاح |
| Warning | `#f97316` | التحذير |
| Purple / Blue | `#8b5cf6` / `#3b82f6` | شارات إضافية |
| نص أساسي / ثانوي | `#333333` / `#666666` | النصوص |
| WhatsApp | `#25D366` | زر واتساب |

## 0.2 الخطوط

- **العائلة:** `Cairo` (300→900) + `Tajawal` احتياطياً + `system-ui`.
- **الاتجاه:** RTL افتراضياً، LTR عند `languages.defaultLang === 'en'`.
- **الهرمية:** `h1-h6` غامقة بلون dark؛ `heading` = `text-3xl → lg:text-[2.6rem] font-extrabold`؛ النصوص `14px` (text-sm) و `16px` (text-base).

## 0.3 الحواف والظلال والحركة

| العنصر | القيمة |
|---|---|
| البطاقات | `rounded-2xl` (16px) |
| الأزرار/الحقول | `rounded-xl` (12px) |
| الشارات/الأزرار الصغيرة | `rounded-lg` (8px) |
| ظل card / hover / nav | `0 2px 12px rgba(16,24,40,.06)` / `0 12px 32px rgba(16,24,40,.12)` / `0 2px 10px rgba(0,0,0,.05)` |
| مدة الانتقال | `300ms` |
| keyframes | `fadeUp`, `fadeIn`, `marquee` (32s)، `slideDown`, `pulseRing` (2s) |

## 0.4 الأزرار (globals.css)

| الصنف | الوصف | hover |
|---|---|---|
| `.btn` | inline-flex، gap-2، rounded-xl، px-6 py-3، semibold | — |
| `.btn-primary` | سماوي + نص أبيض + ظل خفيف | `primary-dark` + ظل hover + `-translate-y-0.5` |
| `.btn-outline` | حدود سماوية 2px + نص سماوي | خلفية سماوية + نص أبيض |
| `.btn-white` | أبيض + نص سماوي | `gray-50` |
| `.btn-ghost-white` | حدود بيضاء + نص أبيض | أبيض + نص سماوي |
| `.btn-danger` | أحمر + أبيض | `red-600` |
| `.btn-muted` | `gray-100` + `gray-700` | `gray-200` |
| `.btn-sm` | px-4 py-2 text-sm rounded-lg | — |

## 0.5 حقول الإدخال (`.input`)

- عرض كامل، `rounded-xl`، حدود `gray-200`، `px-4 py-3`، نص `gray-800 text-sm`، placeholder `gray-400`.
- **Focus:** `border-primary + ring-2 ring-primary/20`.
- `.label`: `text-sm font-semibold text-gray-700 mb-1.5`. `.field-error`: `text-xs text-danger`.

## 0.6 الشارات (Badges)

`badge-primary/green/red/orange/blue/gray/purple` — وحالات المحتوى: `new=blue`, `read/replied/completed/published/approved=green`, `reviewing/interview/scheduled/pending=orange`, `rejected=red`, `draft/archived=gray`, `shortlisted=purple`.

---

