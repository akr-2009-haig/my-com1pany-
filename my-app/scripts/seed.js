/* eslint-disable no-await-in-loop */
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { collection, connect } = require('../lib/datastore');
const { DEFAULT_ROLES } = require('../lib/permissions');
const { settingsDefaults } = require('../lib/schemas');
const { DEFAULT_SECTIONS } = require('../controllers/sections.controller');
const { PAGES: BANNER_PAGES } = require('../controllers/banners.controller');
const { KEYS: PAGE_KEYS } = require('../controllers/pages.controller');
const { makeSlug } = require('../lib/helpers');

const IMG = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ------------------------------------------------------------------ */
/* Base data – always required for the app to run                      */
/* ------------------------------------------------------------------ */
async function ensureBaseData() {
  // Roles
  for (const role of DEFAULT_ROLES) {
    const existing = await collection('roles').findOne({ slug: role.slug });
    if (!existing) await collection('roles').create(role);
    else if (role.slug === 'admin') await collection('roles').updateById(existing._id, { permissions: role.permissions });
  }

  // First administrator
  const userCount = await collection('users').count({});
  if (userCount === 0) {
    const email = (process.env.ADMIN_EMAIL || 'admin@company.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
    await collection('users').create({
      name: process.env.ADMIN_NAME || 'أكرم - المدير العام',
      email,
      username: 'admin',
      password: await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12)),
      role: 'admin',
      isActive: true,
      avatar: '',
    });
    console.log(`[seed] administrator created → ${email} / ${password}`);
  }

  // Settings singleton
  let settings = await collection('settings').findOne({});
  if (!settings) {
    settings = await collection('settings').create({
      siteName: 'أكرم تِك للحلول البرمجية',
      siteNameEn: 'Akram Tech',
      description: 'شريكك التقني الموثوق في رحلة التحول الرقمي. نصمّم ونطوّر مواقع وتطبيقات وأنظمة تُحدث فرقاً حقيقياً في أعمالك.',
      descriptionEn: 'Your trusted technology partner for digital transformation.',
      foundedYear: '2015',
      copyrightText: 'جميع الحقوق محفوظة',
      phone: '+966 55 000 0000',
      phone2: '+966 11 200 0000',
      whatsapp: '966550000000',
      email: 'info@akramtech.sa',
      email2: 'sales@akramtech.sa',
      address: 'الرياض - حي العليا - طريق الملك فهد، برج المملكة، الدور 12',
      workingHours: 'الأحد - الخميس، 9:00 ص - 6:00 م',
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.9!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sar!2ssa!4v1700000000000',
      topBarEnabled: true,
      showMap: true,
      socials: { ...settingsDefaults.socials, facebook: 'https://facebook.com', twitter: 'https://x.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com', youtube: 'https://youtube.com' },
      seo: { ...settingsDefaults.seo, title: 'أكرم تِك | حلول برمجية متكاملة', description: 'شركة برمجية سعودية متخصصة في تطوير المواقع والتطبيقات والأنظمة المؤسسية.', keywords: 'تطوير مواقع, تطبيقات جوال, برمجة, الرياض, تصميم' },
      smtp: settingsDefaults.smtp,
      whatsappSettings: { ...settingsDefaults.whatsappSettings, number: '966550000000' },
      maintenance: settingsDefaults.maintenance,
      languages: settingsDefaults.languages,
      security: settingsDefaults.security,
      notifications: settingsDefaults.notifications,
      backup: settingsDefaults.backup,
      home: settingsDefaults.home,
    });
  }

  // Dropdown lists — merge defaults without overwriting admin changes
  const ddDefaults = settingsDefaults.dropdowns || {};
  const curDD = settings.dropdowns || {};
  let ddChanged = false;
  const dd = {};
  for (const [k, def] of Object.entries(ddDefaults)) {
    if (curDD[k] === undefined) { dd[k] = def; ddChanged = true; }
    else dd[k] = curDD[k];
  }
  if (ddChanged) await collection('settings').updateOne({ _id: settings._id }, { dropdowns: dd }, { upsert: true });

  // Default company departments (jobs)
  if ((await collection('jobdepartments').count({})) === 0) {
    const depts = ['التطوير والبرمجة', 'تصميم المنتج', 'التسويق الرقمي', 'المبيعات وخدمة العملاء', 'الإدارة والموارد البشرية', 'الدعم الفني', 'العمليات والبنية التحتية'];
    for (let i = 0; i < depts.length; i += 1) {
      await collection('jobdepartments').create({ name: depts[i], slug: makeSlug(depts[i], 'dept'), order: i });
    }
  }

  // Home sections order
  const sectionCount = await collection('sections').count({});
  if (sectionCount < DEFAULT_SECTIONS.length) {
    for (let i = 0; i < DEFAULT_SECTIONS.length; i += 1) {
      const d = DEFAULT_SECTIONS[i];
      const exists = await collection('sections').findOne({ key: d.key });
      if (!exists) await collection('sections').create({ ...d, order: i, isVisible: true });
    }
  }

  // Page banners
  for (const b of BANNER_PAGES) {
    const exists = await collection('banners').findOne({ page: b.page });
    if (!exists) {
      await collection('banners').create({
        page: b.page, label: b.label, title: b.label, image: IMG('1451187580459-43490279c0fa', 1600), isActive: true,
      });
    }
  }

  // Editable pages
  for (const [key, title] of Object.entries(PAGE_KEYS)) {
    const exists = await collection('pages').findOne({ key });
    if (!exists) await collection('pages').create({ key, title, content: '', data: {} });
  }

  await ensurePageDefaults();
  return true;
}

async function setPage(key, patch) {
  const doc = await collection('pages').findOne({ key });
  const merged = { ...(doc?.data || {}), ...(patch.data || {}) };
  await collection('pages').updateOne({ key }, { key, ...patch, data: merged }, { upsert: true });
}

async function ensurePageDefaults() {
  const about = await collection('pages').findOne({ key: 'about-section' });
  if (!about || !about.data || !Object.keys(about.data).length) {
    await setPage('about-section', {
      title: 'قسم من نحن',
      data: {
        eyebrow: 'من نحن',
        heading: 'شركة رائدة في الحلول البرمجية منذ 2015',
        text: 'نحن فريق من المهندسين والمصممين نؤمن أن البرمجيات الجيدة تُبنى على فهم عميق للأعمال. نساعد الشركات على رقمنة عملياتها وبناء منتجات رقمية تنافس عالمياً، من الفكرة الأولى وحتى الإطلاق وما بعده.',
        image: IMG('1522071820081-009f0129c71c', 1000),
        points: [{ text: 'فريق محترف بخبرة تتجاوز 10 سنوات' }, { text: 'جودة عالية ومعايير عالمية في التطوير' }, { text: 'التزام كامل بالمواعيد والميزانيات' }],
        buttonText: 'اقرأ المزيد عنّا',
        buttonLink: '/about',
        isVisible: true,
      },
    });
  }

  const why = await collection('pages').findOne({ key: 'whyus' });
  if (!why || !why.data || !Object.keys(why.data).length) {
    await setPage('whyus', {
      title: 'لماذا تختارنا',
      data: {
        eyebrow: 'لماذا نحن',
        heading: 'لماذا تختار أكرم تِك؟',
        text: 'لأننا لا نبيع ساعات عمل، بل نتشارك معك في تحقيق نتيجة. هذه أربعة أسباب تجعل عملاءنا يعودون إلينا في كل مشروع جديد.',
        image: IMG('1600880292203-757bb62b4baf', 1000),
        features: [
          { icon: 'Users', title: 'فريق متخصص', desc: 'مهندسون ومصممون بخبرة عملية في مشاريع محلية وعالمية.' },
          { icon: 'ShieldCheck', title: 'جودة مضمونة', desc: 'مراجعة كود واختبارات آلية قبل كل إصدار.' },
          { icon: 'Clock', title: 'التزام بالمواعيد', desc: 'خطة زمنية واضحة وتقارير أسبوعية عن التقدّم.' },
          { icon: 'Headphones', title: 'دعم مستمر', desc: 'دعم فني وصيانة بعد الإطلاق طوال فترة التعاقد.' },
        ],
        isVisible: true,
      },
    });
  }

  const cta = await collection('pages').findOne({ key: 'cta' });
  if (!cta || !cta.data || !Object.keys(cta.data).length) {
    await setPage('cta', {
      title: 'قسم CTA',
      data: {
        heading: 'هل لديك مشروع في ذهنك؟',
        text: 'فريقنا جاهز لتحويل فكرتك إلى منتج رقمي متكامل. احصل على استشارة مجانية اليوم.',
        image: IMG('1497366754035-f200968a6e72', 1600),
        btn1Text: 'تواصل معنا', btn1Link: '/contact',
        btn2Text: 'اطلب عرض سعر', btn2Link: '/quote',
        showBtn2: true, isVisible: true,
      },
    });
  }

  const vision = await collection('pages').findOne({ key: 'vision-mission' });
  if (!vision || !vision.data || !Object.keys(vision.data).length) {
    await setPage('vision-mission', {
      title: 'الرؤية والرسالة والقيم',
      data: {
        items: [
          { icon: 'Eye', title: 'رؤيتنا', text: 'أن نكون الشريك التقني الأول للشركات الطموحة في المنطقة، وأن نصنع منتجات رقمية يفخر بها عملاؤنا.', isVisible: true },
          { icon: 'Target', title: 'رسالتنا', text: 'تمكين الأعمال من النمو عبر حلول برمجية مبتكرة وسهلة الاستخدام، مبنية على معايير هندسية صارمة.', isVisible: true },
          { icon: 'Gem', title: 'قيمنا', text: 'الشفافية، الإتقان، الالتزام، والتعلم المستمر. نعامل مشروع عميلنا كما نعامل مشروعنا الخاص.', isVisible: true },
        ],
      },
    });
  }

  const contact = await collection('pages').findOne({ key: 'contact' });
  if (!contact || !contact.data || !Object.keys(contact.data).length) {
    await setPage('contact', {
      title: 'إعدادات صفحة تواصل معنا',
      data: {
        successMessage: 'تم إرسال رسالتك بنجاح، سنتواصل معك خلال 24 ساعة.',
        recipientEmail: '',
        recaptcha: false,
        showMap: true,
        fields: [
          { name: 'name', label: 'الاسم الكامل', type: 'text', required: true, visible: true },
          { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, visible: true },
          { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: false, visible: true },
          { name: 'service', label: 'نوع الخدمة', type: 'service', required: false, visible: true },
          { name: 'subject', label: 'الموضوع', type: 'text', required: false, visible: false },
          { name: 'message', label: 'رسالتك', type: 'textarea', required: true, visible: true },
        ],
      },
    });
  }

  const quote = await collection('pages').findOne({ key: 'quote' });
  if (!quote || !quote.data || !Object.keys(quote.data).length) {
    await setPage('quote', {
      title: 'إعدادات صفحة طلب عرض سعر',
      data: {
        successMessage: 'تم استلام طلبك بنجاح، سنرسل لك عرض السعر خلال 48 ساعة.',
        maxFileSizeMb: 10,
        allowedTypes: ['pdf', 'doc', 'docx', 'png', 'jpg'],
        budgets: ['أقل من 5,000$', '5,000$ - 10,000$', '10,000$ - 25,000$', '25,000$ - 50,000$', 'أكثر من 50,000$'],
        timelines: ['أقل من شهر', '1 - 3 أشهر', '3 - 6 أشهر', 'أكثر من 6 أشهر', 'غير محدد'],
        fields: [
          { name: 'name', label: 'الاسم الكامل', type: 'text', required: true, visible: true },
          { name: 'company', label: 'اسم الشركة', type: 'text', required: false, visible: true },
          { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, visible: true },
          { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: true, visible: true },
          { name: 'projectType', label: 'نوع المشروع', type: 'service', required: true, visible: true },
          { name: 'budget', label: 'الميزانية التقريبية', type: 'budget', required: false, visible: true },
          { name: 'timeline', label: 'الجدول الزمني', type: 'timeline', required: false, visible: true },
          { name: 'description', label: 'وصف المشروع', type: 'textarea', required: true, visible: true },
          { name: 'attachments', label: 'ملفات مرفقة', type: 'file', required: false, visible: true },
        ],
      },
    });
  }

  const nf = await collection('pages').findOne({ key: 'notfound' });
  if (!nf || !nf.data || !Object.keys(nf.data).length) {
    await setPage('notfound', {
      title: 'صفحة 404',
      data: {
        heading: 'الصفحة غير موجودة',
        text: 'يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.',
        buttonText: 'العودة للرئيسية',
        buttonLink: '/',
        image: '',
      },
    });
  }

  const careers = await collection('pages').findOne({ key: 'careers' });
  if (!careers || !careers.data || !Object.keys(careers.data).length) {
    await setPage('careers', {
      title: 'ثقافة العمل',
      data: {
        heading: 'ثقافة العمل لدينا',
        text: 'نؤمن أن الناس هم أهم أصولنا. نوفّر بيئة عمل مرنة، وفرص تعلّم مستمرة، ومشاريع تقنية حقيقية تترك أثراً.',
        images: [IMG('1522071820081-009f0129c71c', 800), IMG('1600880292089-90a7e086ee0c', 800), IMG('1531482615713-2afd69097998', 800)],
        perks: [
          { icon: 'Laptop', title: 'عمل مرن', desc: 'نظام هجين ودوام مرن' },
          { icon: 'GraduationCap', title: 'تعلّم مستمر', desc: 'ميزانية سنوية للدورات والمؤتمرات' },
          { icon: 'HeartPulse', title: 'تأمين شامل', desc: 'تأمين طبي لك ولعائلتك' },
          { icon: 'TrendingUp', title: 'مسار وظيفي', desc: 'خطة ترقّي واضحة ومراجعات دورية' },
        ],
      },
    });
  }

  for (const key of ['privacy', 'terms']) {
    const p = await collection('pages').findOne({ key });
    if (!p || !p.content) {
      const isPrivacy = key === 'privacy';
      await setPage(key, {
        title: isPrivacy ? 'سياسة الخصوصية' : 'الشروط والأحكام',
        content: isPrivacy ? PRIVACY_HTML : TERMS_HTML,
        data: { updatedAt: new Date().toISOString().slice(0, 10) },
      });
    }
  }
}

const PRIVACY_HTML = `
<h2>مقدمة</h2><p>نلتزم في شركتنا بحماية خصوصية زوّار موقعنا وعملائنا. توضّح هذه السياسة أنواع البيانات التي نجمعها وكيفية استخدامها وحمايتها.</p>
<h2>البيانات التي نجمعها</h2><ul><li>البيانات التي تزوّدنا بها طوعاً عبر نماذج التواصل وطلب عروض الأسعار (الاسم، البريد، الهاتف).</li><li>بيانات الاستخدام التقنية مثل الصفحات التي تمت زيارتها ونوع المتصفح والجهاز.</li><li>ملفات تعريف الارتباط (Cookies) الضرورية لتشغيل الموقع وقياس الأداء.</li></ul>
<h2>كيف نستخدم بياناتك</h2><ul><li>الرد على استفساراتك وتقديم عروض الأسعار.</li><li>تحسين تجربة الاستخدام وتطوير خدماتنا.</li><li>إرسال تحديثات أو عروض عند موافقتك المسبقة فقط.</li></ul>
<h2>مشاركة البيانات</h2><p>لا نبيع بياناتك أو نؤجّرها لأي طرف ثالث. قد نشاركها فقط مع مزوّدي خدمات موثوقين يساعدوننا في تشغيل الموقع، وبموجب اتفاقيات سرية.</p>
<h2>حماية البيانات</h2><p>نستخدم التشفير أثناء النقل (HTTPS)، وتخزيناً آمناً لكلمات المرور، وضوابط وصول صارمة، ونسخاً احتياطية دورية.</p>
<h2>حقوقك</h2><p>يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت عبر مراسلتنا على البريد الإلكتروني الموضّح في صفحة التواصل.</p>
<h2>التعديلات على السياسة</h2><p>قد نحدّث هذه السياسة من وقت لآخر، وسيظهر تاريخ آخر تحديث أعلى الصفحة.</p>`;

const TERMS_HTML = `
<h2>قبول الشروط</h2><p>باستخدامك لهذا الموقع فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا لم توافق عليها يرجى عدم استخدام الموقع.</p>
<h2>استخدام الموقع</h2><ul><li>يُمنع استخدام الموقع لأي غرض غير قانوني أو ضار.</li><li>يُمنع محاولة اختراق الموقع أو التأثير على أدائه.</li><li>يُمنع نسخ محتوى الموقع أو إعادة نشره دون إذن كتابي.</li></ul>
<h2>الملكية الفكرية</h2><p>جميع النصوص والصور والشعارات والأكواد المعروضة في الموقع مملوكة للشركة ومحمية بموجب قوانين الملكية الفكرية.</p>
<h2>الخدمات والأسعار</h2><p>الأسعار المعروضة في صفحة الباقات إرشادية وقد تختلف حسب نطاق المشروع. يُعتمد السعر النهائي في عرض سعر رسمي موقّع من الطرفين.</p>
<h2>حدود المسؤولية</h2><p>نبذل أقصى جهد لضمان دقة المعلومات، لكننا لا نتحمّل مسؤولية أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الموقع.</p>
<h2>القانون الواجب التطبيق</h2><p>تخضع هذه الشروط لأنظمة المملكة العربية السعودية، وأي نزاع ينشأ عنها يُحال إلى الجهات القضائية المختصة.</p>`;

/* ------------------------------------------------------------------ */
/* Demo content – realistic starter data                               */
/* ------------------------------------------------------------------ */
async function seedDemoContent() {
  if (await collection('services').count({}) > 0) return false;
  console.log('[seed] inserting starter content…');

  /* Slides */
  const slides = [
    { title: 'نحوّل أفكارك إلى واقع رقمي', subtitle: 'شريكك التقني الموثوق في رحلة التحول الرقمي', image: IMG('1498050108023-c5249f4df085', 1920), btn1Text: 'ابدأ مشروعك', btn1Link: '/quote', btn2Text: 'شاهد أعمالنا', btn2Link: '/portfolio' },
    { title: 'تطبيقات جوال تُحبّها الناس', subtitle: 'تصميم وتطوير تطبيقات iOS و Android بأداء عالٍ وتجربة استخدام مميزة', image: IMG('1512941937669-90a1b58e7e9c', 1920), btn1Text: 'تعرّف على خدماتنا', btn1Link: '/services', btn2Text: 'تواصل معنا', btn2Link: '/contact' },
    { title: 'أنظمة مؤسسية تُدير أعمالك', subtitle: 'أنظمة ERP و CRM مخصّصة تناسب طبيعة عملك وتنمو معك', image: IMG('1460925895917-afdab827c52f', 1920), btn1Text: 'اطلب عرض سعر', btn1Link: '/quote', btn2Text: 'الباقات', btn2Link: '/pricing' },
  ];
  for (let i = 0; i < slides.length; i += 1) await collection('slides').create({ ...slides[i], order: i, isActive: true, showBtn2: true });

  /* Stats */
  const stats = [
    { value: 320, label: 'مشروع منجز', icon: 'CheckCircle2' },
    { value: 180, label: 'عميل سعيد', icon: 'Smile' },
    { value: 10, label: 'سنة خبرة', icon: 'CalendarDays' },
    { value: 45, label: 'مطوّر محترف', icon: 'Users' },
  ];
  for (let i = 0; i < stats.length; i += 1) await collection('stats').create({ ...stats[i], order: i, isActive: true, showPlus: true });

  /* Services */
  const services = [
    { title: 'تطوير المواقع الإلكترونية', icon: 'Globe', shortDesc: 'مواقع سريعة ومتجاوبة ومهيأة لمحركات البحث تعكس هوية علامتك التجارية.', image: IMG('1547658719-da2b51169166', 1000) },
    { title: 'تطبيقات الجوال', icon: 'Smartphone', shortDesc: 'تطبيقات أصلية وهجينة لنظامي iOS و Android بتجربة استخدام سلسة.', image: IMG('1512941937669-90a1b58e7e9c', 1000) },
    { title: 'الأنظمة المؤسسية', icon: 'Database', shortDesc: 'أنظمة ERP و CRM ولوحات تحكم مخصّصة تُدار بالكامل حسب احتياجك.', image: IMG('1551288049-bebda4e38f71', 1000) },
    { title: 'المتاجر الإلكترونية', icon: 'ShoppingCart', shortDesc: 'متاجر متكاملة مع بوابات الدفع والشحن وإدارة المخزون والتقارير.', image: IMG('1556742049-0cfed4f6a45d', 1000) },
    { title: 'تصميم واجهات UI/UX', icon: 'Palette', shortDesc: 'تصاميم عصرية مبنية على أبحاث المستخدم واختبارات قابلية الاستخدام.', image: IMG('1561070791-2526d30994b5', 1000) },
    { title: 'الاستضافة والدعم الفني', icon: 'Server', shortDesc: 'استضافة سحابية آمنة مع مراقبة على مدار الساعة ونسخ احتياطية يومية.', image: IMG('1558494949-ef010cbdcc31', 1000) },
    { title: 'التسويق الرقمي و SEO', icon: 'TrendingUp', shortDesc: 'تحسين الظهور في محركات البحث وحملات إعلانية مدروسة بعائد قابل للقياس.', image: IMG('1460925895917-afdab827c52f', 1000) },
    { title: 'الذكاء الاصطناعي والأتمتة', icon: 'Bot', shortDesc: 'حلول ذكية لأتمتة العمليات وتحليل البيانات ودعم اتخاذ القرار.', image: IMG('1677442136019-21780ecad995', 1000) },
  ];
  const serviceDocs = [];
  for (let i = 0; i < services.length; i += 1) {
    const s = services[i];
    serviceDocs.push(await collection('services').create({
      ...s,
      slug: makeSlug(s.title, 'service'),
      description: `<h2>عن الخدمة</h2><p>${s.shortDesc} نعمل معك خطوة بخطوة بدءاً من فهم متطلبات عملك، مروراً بالتصميم والتطوير والاختبار، وانتهاءً بالإطلاق والدعم المستمر.</p><h3>كيف نعمل؟</h3><ol><li><strong>الاكتشاف:</strong> جلسات عمل لفهم أهدافك ومستخدميك.</li><li><strong>التصميم:</strong> نماذج أولية قابلة للنقر قبل كتابة أي سطر برمجي.</li><li><strong>التطوير:</strong> دورات تسليم قصيرة مع مراجعة أسبوعية.</li><li><strong>الإطلاق والدعم:</strong> نشر آمن ومتابعة الأداء بعد الإطلاق.</li></ol>`,
      features: [{ text: 'تحليل متطلبات مفصّل' }, { text: 'تصميم متجاوب لكل الأجهزة' }, { text: 'كود نظيف وموثّق' }, { text: 'دعم فني بعد التسليم' }],
      technologies: [{ name: 'React', logo: '' }, { name: 'Node.js', logo: '' }, { name: 'MongoDB', logo: '' }],
      bannerImage: IMG('1451187580459-43490279c0fa', 1600),
      isFeatured: i < 6, isActive: true, status: 'published', order: i,
      seoTitle: s.title, seoDesc: s.shortDesc,
    }));
  }

  /* Project categories */
  const catNames = ['مواقع ويب', 'تطبيقات موبايل', 'أنظمة إدارة', 'متاجر إلكترونية', 'تصميم UI/UX', 'تطبيقات ويب', 'هوية بصرية', 'أخرى'];
  const cats = [];
  for (let i = 0; i < catNames.length; i += 1) {
    cats.push(await collection('projectcategories').create({ name: catNames[i], slug: makeSlug(catNames[i], 'cat'), isActive: true, order: i, icon: 'Folder' }));
  }

  /* Projects */
  const projects = [
    { title: 'منصة "رِفد" للتجارة الإلكترونية', cat: 3, client: 'شركة رفد التجارية', img: '1556742049-0cfed4f6a45d' },
    { title: 'تطبيق "صحّتي" للرعاية الصحية', cat: 1, client: 'مجموعة الرعاية الطبية', img: '1576091160399-112ba8d25d1d' },
    { title: 'نظام إدارة الموارد ERP', cat: 2, client: 'مصانع الخليج', img: '1551288049-bebda4e38f71' },
    { title: 'موقع "بناء" العقاري', cat: 0, client: 'بناء للتطوير العقاري', img: '1560518883-ce09059eeffa' },
    { title: 'تطبيق التوصيل "وصلني"', cat: 1, client: 'وصلني لوجستكس', img: '1526367790999-0150786686a2' },
    { title: 'هوية ومنصة "ابتكار"', cat: 4, client: 'حاضنة ابتكار', img: '1561070791-2526d30994b5' },
    { title: 'بوابة التعليم الإلكتروني', cat: 0, client: 'أكاديمية المعرفة', img: '1522202176988-66273c2fd55f' },
    { title: 'نظام نقاط البيع POS', cat: 2, client: 'سلسلة مقاهي حبّة', img: '1554774853-719586f82d77' },
    { title: 'متجر الأزياء "لمسة"', cat: 3, client: 'لمسة فاشن', img: '1441986300917-64674bd600d8' },
  ];
  for (let i = 0; i < projects.length; i += 1) {
    const p = projects[i];
    await collection('projects').create({
      title: p.title,
      slug: makeSlug(p.title, 'project'),
      category: String(cats[p.cat]._id),
      client: p.client,
      description: `<p>مشروع متكامل نفّذناه لصالح ${p.client}. عملنا على تحليل احتياجات العميل وبناء حل رقمي يخدم أهداف العمل ويحسّن تجربة المستخدم النهائي.</p><p>تم بناء الحل بمعمارية قابلة للتوسّع مع لوحة تحكم كاملة تتيح للعميل إدارة المحتوى والبيانات بنفسه.</p>`,
      challenge: 'كان التحدي الأساسي هو التعامل مع حجم بيانات كبير مع الحفاظ على سرعة استجابة أقل من ثانية واحدة، إضافة إلى دعم كامل للغة العربية واتجاه RTL.',
      solution: 'اعتمدنا معمارية خدمات مصغّرة مع تخزين مؤقت ذكي وفهرسة محسّنة لقواعد البيانات، ما خفّض زمن الاستجابة بنسبة 70% مقارنة بالنظام السابق.',
      images: [IMG(p.img, 1400), IMG('1460925895917-afdab827c52f', 1400), IMG('1498050108023-c5249f4df085', 1400)],
      cover: IMG(p.img, 1200),
      technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
      liveUrl: 'https://example.com',
      projectDate: new Date(2024, i % 12, 10),
      isFeatured: i < 6, isActive: true, status: 'published', order: i,
      views: 120 + i * 37,
    });
  }

  /* Packages */
  const packages = [
    { name: 'الباقة الأساسية', monthlyPrice: 1500, yearlyPrice: 15000, isPopular: false, features: ['موقع من 5 صفحات', 'تصميم متجاوب', 'لوحة تحكم أساسية', 'دعم فني شهر واحد', 'تحسين SEO أساسي', 'دومين مجاني سنة'], excluded: [4, 5] },
    { name: 'الباقة الاحترافية', monthlyPrice: 3500, yearlyPrice: 35000, isPopular: true, features: ['موقع حتى 15 صفحة', 'تصميم مخصص بالكامل', 'لوحة تحكم متقدمة', 'دعم فني 6 أشهر', 'تحسين SEO متقدم', 'دومين واستضافة سنة', 'تكامل مع بوابات الدفع'], excluded: [] },
    { name: 'باقة الشركات', monthlyPrice: 7500, yearlyPrice: 75000, isPopular: false, features: ['صفحات غير محدودة', 'تصميم وهوية كاملة', 'نظام مخصص بالكامل', 'دعم فني سنة كاملة', 'تحسين SEO احترافي', 'استضافة سحابية مخصصة', 'تطبيق جوال مصاحب', 'مدير حساب مخصص'], excluded: [] },
  ];
  for (let i = 0; i < packages.length; i += 1) {
    const p = packages[i];
    await collection('packages').create({
      name: p.name, slug: makeSlug(p.name, 'package'),
      description: 'باقة مصمّمة لتناسب احتياجك مع إمكانية التخصيص الكامل.',
      monthlyPrice: p.monthlyPrice, yearlyPrice: p.yearlyPrice, currency: 'SAR',
      features: p.features.map((text, idx) => ({ text, included: !p.excluded.includes(idx) })),
      isPopular: p.isPopular, isActive: true, showOnHome: true, order: i,
      buttonText: 'اطلب الآن',
    });
  }

  /* Blog categories, tags & posts */
  const postCatNames = ['تطوير الويب', 'تطبيقات الجوال', 'تصميم UI/UX', 'ريادة الأعمال', 'أمن المعلومات'];
  const postCats = [];
  for (let i = 0; i < postCatNames.length; i += 1) {
    postCats.push(await collection('postcategories').create({ name: postCatNames[i], slug: makeSlug(postCatNames[i], 'cat'), isActive: true, order: i }));
  }
  const tagNames = ['React', 'Next.js', 'أداء', 'SEO', 'تصميم', 'أمان', 'قواعد بيانات', 'ذكاء اصطناعي'];
  for (const t of tagNames) await collection('tags').create({ name: t, slug: makeSlug(t, 'tag') });

  const admin = await collection('users').findOne({ role: 'admin' });
  const posts = [
    { title: '7 خطوات عملية لتسريع موقعك الإلكتروني', cat: 0, tags: ['أداء', 'SEO'], img: '1460925895917-afdab827c52f' },
    { title: 'كيف تختار بين التطبيق الأصلي والهجين؟', cat: 1, tags: ['React'], img: '1512941937669-90a1b58e7e9c' },
    { title: 'مبادئ تصميم واجهات عربية RTL بشكل صحيح', cat: 2, tags: ['تصميم'], img: '1561070791-2526d30994b5' },
    { title: 'دليل المبتدئين لبناء MVP خلال 30 يوماً', cat: 3, tags: ['Next.js'], img: '1522071820081-009f0129c71c' },
    { title: '10 ثغرات أمنية شائعة في تطبيقات الويب', cat: 4, tags: ['أمان'], img: '1550751827-4bd374c3f58b' },
    { title: 'متى تحتاج شركتك إلى نظام ERP مخصص؟', cat: 0, tags: ['قواعد بيانات'], img: '1551288049-bebda4e38f71' },
  ];
  for (let i = 0; i < posts.length; i += 1) {
    const p = posts[i];
    const content = `<p>في هذا المقال نستعرض أهم النقاط العملية التي تساعدك على اتخاذ قرار صحيح، بناءً على خبرتنا في تنفيذ أكثر من 300 مشروع تقني.</p>
<h2>لماذا يهمّ هذا الموضوع؟</h2><p>كثير من الشركات تخسر فرصاً حقيقية بسبب قرارات تقنية متسرّعة. الفهم الصحيح للخيارات المتاحة يوفّر وقتاً وميزانية كبيرة على المدى الطويل.</p>
<h2>النقاط الأساسية</h2><ul><li>ابدأ من المشكلة لا من التقنية.</li><li>قِس قبل أن تُحسّن — الأرقام لا تكذب.</li><li>اختر حلاً يمكن لفريقك صيانته.</li><li>خطّط للتوسّع من اليوم الأول.</li></ul>
<blockquote>القرار التقني الجيد هو القرار الذي يمكن التراجع عنه بأقل تكلفة ممكنة.</blockquote>
<h2>خلاصة</h2><p>لا توجد إجابة واحدة تناسب الجميع، لكن اتباع منهجية واضحة يقلّل المخاطر بشكل كبير. إذا احتجت استشارة مجانية، فريقنا جاهز لمساعدتك.</p>`;
    await collection('posts').create({
      title: p.title,
      slug: makeSlug(p.title, 'post'),
      excerpt: 'نستعرض في هذا المقال أهم النقاط العملية التي تساعدك على اتخاذ القرار الصحيح بناءً على خبرة عملية في أكثر من 300 مشروع تقني.',
      content,
      image: IMG(p.img, 1200),
      categories: [String(postCats[p.cat]._id)],
      tags: p.tags,
      author: admin ? String(admin._id) : null,
      authorName: admin?.name || 'فريق التحرير',
      status: 'published',
      publishAt: new Date(Date.now() - i * 4 * 86400000),
      readTime: 5 + i,
      views: 340 + i * 111,
      isFeatured: i < 3,
      seoTitle: p.title,
      seoDesc: 'مقال تقني من مدونة أكرم تِك.',
    });
  }

  /* Testimonials */
  const testimonials = [
    { name: 'م. خالد العتيبي', position: 'المدير التنفيذي', company: 'رفد التجارية', content: 'فريق محترف بكل ما تعنيه الكلمة. سلّمونا المشروع قبل الموعد بأسبوع وبجودة فاقت توقعاتنا. التواصل كان واضحاً في كل مرحلة.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=12' },
    { name: 'أ. نورة القحطاني', position: 'مديرة التسويق', company: 'مجموعة الرعاية', content: 'التطبيق الذي طوّروه لنا رفع تفاعل المستخدمين بنسبة 60% خلال ثلاثة أشهر فقط. أنصح بهم بشدة لأي شركة تبحث عن جودة حقيقية.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=45' },
    { name: 'م. سعد الدوسري', position: 'مدير تقنية المعلومات', company: 'مصانع الخليج', content: 'نظام ERP الذي بنوه لنا غيّر طريقة عملنا بالكامل. الدعم الفني سريع الاستجابة ودائماً متعاون.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=33' },
    { name: 'أ. ريم الشمري', position: 'مؤسِّسة', company: 'لمسة فاشن', content: 'متجرنا الإلكتروني أصبح أسرع وأجمل، والمبيعات تضاعفت. شكراً لكل الفريق على الاحترافية والصبر.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=27' },
    { name: 'م. فهد المطيري', position: 'شريك مؤسس', company: 'وصلني لوجستكس', content: 'من أفضل الشركات التي تعاملنا معها. فهموا فكرتنا من أول اجتماع وحوّلوها إلى منتج ناجح.', rating: 4, avatar: 'https://i.pravatar.cc/150?img=52' },
  ];
  for (let i = 0; i < testimonials.length; i += 1) await collection('testimonials').create({ ...testimonials[i], isActive: true, order: i });

  /* Partners */
  const partners = ['أرامكو', 'stc', 'سابك', 'الراجحي', 'موبايلي', 'البنك الأهلي', 'نون', 'جرير'];
  for (let i = 0; i < partners.length; i += 1) {
    await collection('partners').create({
      name: partners[i],
      logo: `https://dummyimage.com/220x90/ffffff/1a1a2e.png&text=${encodeURIComponent(partners[i])}`,
      url: 'https://example.com', isActive: true, order: i,
    });
  }

  /* Team */
  const team = [
    { name: 'أكرم الحايك', position: 'المؤسس والرئيس التنفيذي', avatar: 'https://i.pravatar.cc/300?img=68', bio: 'خبرة 15 عاماً في هندسة البرمجيات وقيادة الفرق التقنية.' },
    { name: 'م. لينا حسن', position: 'مديرة التقنية CTO', avatar: 'https://i.pravatar.cc/300?img=47', bio: 'متخصصة في معمارية الأنظمة السحابية وقابلية التوسّع.' },
    { name: 'م. عمر الزهراني', position: 'قائد فريق التطوير', avatar: 'https://i.pravatar.cc/300?img=15', bio: 'خبير في React و Node.js وبناء الأنظمة عالية الأداء.' },
    { name: 'أ. سارة المالكي', position: 'مديرة تصميم المنتج', avatar: 'https://i.pravatar.cc/300?img=31', bio: 'تصميم تجارب مستخدم مبنية على البحث والاختبار.' },
  ];
  for (let i = 0; i < team.length; i += 1) {
    await collection('team').create({ ...team[i], linkedin: 'https://linkedin.com', twitter: 'https://x.com', email: 'team@akramtech.sa', isActive: true, order: i });
  }

  /* Timeline */
  const timeline = [
    { year: '2015', title: 'انطلاقة الشركة', description: 'بدأنا بفريق من ثلاثة مهندسين ومكتب صغير وحلم كبير.' },
    { year: '2017', title: 'أول 50 مشروعاً', description: 'وصلنا إلى 50 مشروعاً منجزاً وتوسّع الفريق إلى 12 شخصاً.' },
    { year: '2019', title: 'التوسّع الإقليمي', description: 'افتتحنا مكتباً ثانياً وبدأنا خدمة عملاء خارج المملكة.' },
    { year: '2021', title: 'شراكات استراتيجية', description: 'شراكات مع مزوّدي خدمات سحابية عالميين واعتمادات رسمية.' },
    { year: '2023', title: 'قسم الذكاء الاصطناعي', description: 'أطلقنا وحدة متخصصة في حلول الذكاء الاصطناعي والأتمتة.' },
    { year: '2025', title: '320 مشروعاً و45 موظفاً', description: 'اليوم نخدم أكثر من 180 عميلاً بفريق من 45 محترفاً.' },
  ];
  for (let i = 0; i < timeline.length; i += 1) await collection('timeline').create({ ...timeline[i], isActive: true, order: i });

  /* Certificates */
  const certs = ['ISO 27001', 'AWS Partner', 'Microsoft Gold', 'Google Cloud Partner'];
  for (let i = 0; i < certs.length; i += 1) {
    await collection('certificates').create({
      title: certs[i], issuer: certs[i],
      image: `https://dummyimage.com/600x420/f5f7fa/00BCD4.png&text=${encodeURIComponent(certs[i])}`,
      isActive: true, order: i,
    });
  }

  /* FAQ */
  const faqCatNames = ['عام', 'الخدمات والمشاريع', 'الأسعار والباقات', 'طريقة العمل', 'الدعم الفني', 'الشراكات والتعاون'];
  const faqCats = [];
  for (let i = 0; i < faqCatNames.length; i += 1) {
    faqCats.push(await collection('faqcategories').create({ name: faqCatNames[i], slug: makeSlug(faqCatNames[i], 'faq'), isActive: true, order: i }));
  }
  const faqs = [
    { q: 'كم يستغرق تنفيذ موقع إلكتروني؟', a: '<p>يعتمد ذلك على حجم المشروع. الموقع التعريفي يستغرق من 3 إلى 5 أسابيع، بينما المتجر الإلكتروني أو النظام المخصص قد يستغرق من 8 إلى 16 أسبوعاً.</p>', c: 0, pricing: true },
    { q: 'هل تقدّمون خدمة الصيانة بعد التسليم؟', a: '<p>نعم، جميع مشاريعنا تشمل فترة دعم مجاني، ويمكن تجديد عقد الصيانة سنوياً بباقات مرنة تشمل التحديثات والنسخ الاحتياطي والمراقبة.</p>', c: 3, pricing: true },
    { q: 'ما هي طرق الدفع المتاحة؟', a: '<p>نقبل التحويل البنكي والدفع الإلكتروني. عادةً يُقسّم المشروع على ثلاث دفعات: 40% مقدماً، 30% عند التسليم الأولي، و30% عند الإطلاق النهائي.</p>', c: 2, pricing: true },
    { q: 'هل أملك الكود المصدري للمشروع؟', a: '<p>نعم بالتأكيد. بعد سداد كامل المستحقات تُنقل جميع حقوق الملكية الفكرية والكود المصدري إليك.</p>', c: 0, pricing: false },
    { q: 'ما التقنيات التي تستخدمونها؟', a: '<p>نعتمد على تقنيات حديثة ومستقرة: React و Next.js للواجهات، Node.js و Laravel للخوادم، MongoDB و PostgreSQL لقواعد البيانات، مع نشر على AWS أو Azure.</p>', c: 1, pricing: false },
    { q: 'هل يمكن تعديل الباقة بعد الاشتراك؟', a: '<p>نعم، يمكنك الترقية أو التخصيص في أي وقت وسيتم احتساب الفرق بشكل تناسبي.</p>', c: 2, pricing: true },
    { q: 'هل تدعمون اللغتين العربية والإنجليزية؟', a: '<p>نعم، جميع مشاريعنا تدعم RTL و LTR بالكامل، ويمكن تفعيل الموقع ثنائي اللغة من لوحة التحكم.</p>', c: 1, pricing: false },
    { q: 'كيف أتابع تقدّم المشروع؟', a: '<p>نوفّر لك لوحة متابعة وتقارير أسبوعية، إضافة إلى اجتماع دوري كل أسبوعين لعرض ما تم إنجازه.</p>', c: 0, pricing: false },
  ];
  for (let i = 0; i < faqs.length; i += 1) {
    await collection('faqs').create({
      question: faqs[i].q, answer: faqs[i].a, category: String(faqCats[faqs[i].c]._id),
      showOnPricing: faqs[i].pricing, isActive: true, order: i,
    });
  }

  /* Jobs (departments are seeded in ensureBaseData; only add if none exist) */
  if ((await collection('jobdepartments').count({})) === 0) {
    const depts = ['التطوير', 'التصميم', 'التسويق', 'الإدارة'];
    for (let i = 0; i < depts.length; i += 1) await collection('jobdepartments').create({ name: depts[i], slug: makeSlug(depts[i], 'dept'), order: i });
  }
  const jobs = [
    { title: 'مطوّر Full Stack (React / Node)', department: 'التطوير', type: 'full-time', location: 'الرياض' },
    { title: 'مصمم واجهات UI/UX', department: 'التصميم', type: 'remote', location: 'عن بُعد' },
    { title: 'مهندس DevOps', department: 'التطوير', type: 'full-time', location: 'الرياض' },
    { title: 'أخصائي تسويق رقمي', department: 'التسويق', type: 'part-time', location: 'جدة' },
  ];
  for (let i = 0; i < jobs.length; i += 1) {
    const j = jobs[i];
    await collection('jobs').create({
      ...j,
      slug: makeSlug(j.title, 'job'),
      salaryRange: '12,000 - 20,000 ريال',
      description: `<p>نبحث عن ${j.title} للانضمام إلى فريقنا والمساهمة في بناء منتجات رقمية يستخدمها آلاف المستخدمين يومياً.</p>`,
      requirements: '<ul><li>خبرة لا تقل عن 3 سنوات في مجال مشابه</li><li>إجادة العمل ضمن فريق ومنهجيات Agile</li><li>مهارات تواصل ممتازة بالعربية والإنجليزية</li><li>شهادة جامعية في تخصص ذي صلة</li></ul>',
      skills: '<ul><li>JavaScript / TypeScript</li><li>Git و CI/CD</li><li>كتابة اختبارات آلية</li><li>الاهتمام بالتفاصيل</li></ul>',
      benefits: '<ul><li>تأمين طبي شامل لك ولعائلتك</li><li>ميزانية سنوية للتدريب والمؤتمرات</li><li>نظام عمل مرن وهجين</li><li>بدل مواصلات وجهاز عمل حديث</li></ul>',
      deadline: new Date(Date.now() + (30 + i * 10) * 86400000),
      isActive: true, order: i,
    });
  }

  /* Menus */
  const headerMenu = [
    { title: 'الرئيسية', url: '/' },
    { title: 'من نحن', url: '/about' },
    { title: 'الخدمات', url: '/services' },
    { title: 'معرض الأعمال', url: '/portfolio' },
    { title: 'الباقات', url: '/pricing' },
    { title: 'المدونة', url: '/blog' },
    { title: 'الوظائف', url: '/careers' },
    { title: 'تواصل معنا', url: '/contact' },
  ];
  for (let i = 0; i < headerMenu.length; i += 1) {
    await collection('menus').create({ ...headerMenu[i], location: 'header', isActive: true, order: i });
  }
  const footerMenu = [
    { title: 'الرئيسية', url: '/' }, { title: 'من نحن', url: '/about' },
    { title: 'الخدمات', url: '/services' }, { title: 'المشاريع', url: '/portfolio' },
    { title: 'المدونة', url: '/blog' }, { title: 'تواصل معنا', url: '/contact' },
  ];
  for (let i = 0; i < footerMenu.length; i += 1) {
    await collection('menus').create({ ...footerMenu[i], location: 'footer', isActive: true, order: i });
  }

  /* A few demo leads so the dashboard is not empty */
  await collection('messages').create({ name: 'محمد العلي', email: 'mohammed@example.com', phone: '0551234567', service: 'تطوير المواقع الإلكترونية', message: 'أرغب في تطوير موقع تعريفي لشركتي مع لوحة تحكم عربية.', status: 'new' });
  await collection('messages').create({ name: 'هند السالم', email: 'hind@example.com', phone: '0509876543', service: 'تطبيقات الجوال', message: 'لدي فكرة تطبيق توصيل وأحتاج تقدير تكلفة مبدئي.', status: 'new' });
  await collection('quotes').create({ name: 'سعد الغامدي', company: 'مؤسسة سعد', email: 'saad@example.com', phone: '0533334444', projectType: 'المتاجر الإلكترونية', budget: '10,000$ - 25,000$', timeline: '1 - 3 أشهر', description: 'متجر إلكتروني لبيع المنتجات الغذائية مع تكامل مع شركات الشحن.', status: 'new' });

  /* Seed 45 days of demo traffic */
  const paths = ['/', '/services', '/portfolio', '/blog', '/contact', '/pricing', '/about'];
  const sources = ['direct', 'search', 'social', 'referral'];
  const devices = ['desktop', 'mobile', 'mobile', 'tablet'];
  for (let d = 45; d >= 0; d -= 1) {
    const count = 20 + Math.floor(Math.random() * 45) + (45 - d);
    for (let i = 0; i < count / 6; i += 1) {
      await collection('visits').create({
        path: paths[Math.floor(Math.random() * paths.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: ['Chrome', 'Safari', 'Edge', 'Firefox'][Math.floor(Math.random() * 4)],
        os: ['Windows', 'iOS', 'Android', 'macOS'][Math.floor(Math.random() * 4)],
        sessionId: `seed-${d}-${i}`,
        isBounce: Math.random() > 0.55,
        createdAt: new Date(Date.now() - d * 86400000),
      });
    }
  }
  // fix createdAt for the file driver (create() sets its own timestamp)
  console.log('[seed] starter content ready');
  return true;
}

async function run() {
  await connect();
  await ensureBaseData();
  await seedDemoContent();
  require('../lib/datastore').flushSync();
  console.log('[seed] done');
  process.exit(0);
}

module.exports = { ensureBaseData, seedDemoContent, run };

if (require.main === module) run().catch((e) => { console.error(e); process.exit(1); });
