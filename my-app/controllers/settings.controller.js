const { collection } = require('../lib/datastore');
const { settingsDefaults } = require('../lib/schemas');
const { sendMail, layout, getTransport } = require('../lib/mailer');
const emitEvent = require('../events/emitEvent');
const maintenance = require('../middleware/maintenance');

const PUBLIC_FIELDS = ['siteName', 'siteNameEn', 'logo', 'logoLight', 'favicon', 'description', 'descriptionEn',
  'foundedYear', 'copyrightText', 'companyProfile', 'phone', 'phone2', 'whatsapp', 'email', 'email2',
  'address', 'addressEn', 'workingHours', 'mapEmbed', 'showMap', 'topBarEnabled', 'socials', 'languages', 'home'];

function withDefaults(doc = {}) {
  const out = { ...doc };
  for (const [k, v] of Object.entries(settingsDefaults)) out[k] = { ...v, ...(doc[k] || {}) };
  return out;
}

async function getSettingsDoc() {
  let s = await collection('settings').findOne({});
  if (!s) s = await collection('settings').create({});
  return withDefaults(s);
}

exports.getSettingsDoc = getSettingsDoc;

/** Full settings – admin only. */
exports.get = async (req, res, next) => {
  try { res.json(await getSettingsDoc()); } catch (e) { next(e); }
};

/** Trimmed settings – safe for the public site (no SMTP/keys). */
exports.getPublic = async (req, res, next) => {
  try {
    const s = await getSettingsDoc();
    const out = {};
    PUBLIC_FIELDS.forEach((f) => { out[f] = s[f]; });
    out.whatsappSettings = { ...s.whatsappSettings, secretKey: undefined };
    out.seo = { title: s.seo.title, description: s.seo.description, keywords: s.seo.keywords, ogImage: s.seo.ogImage, ga: s.seo.ga, gtm: s.seo.gtm, pixel: s.seo.pixel };
    out.security = { recaptchaEnabled: s.security.recaptchaEnabled, siteKey: s.security.siteKey };
    res.json(out);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const current = await getSettingsDoc();
    const patch = { ...req.body };
    delete patch._id;
    // merge nested objects instead of overwriting
    for (const key of Object.keys(settingsDefaults)) {
      if (patch[key] && typeof patch[key] === 'object') patch[key] = { ...current[key], ...patch[key] };
    }
    const doc = await collection('settings').updateOne({ _id: current._id }, patch, { upsert: true });
    maintenance.invalidate();
    emitEvent('settings:updated', { action: 'update' });
    return res.json(withDefaults(doc));
  } catch (e) { return next(e); }
};

/** Update just one settings group (contact / seo / smtp ...). */
exports.updateGroup = async (req, res, next) => {
  try {
    const group = req.params.group;
    const current = await getSettingsDoc();
    if (settingsDefaults[group]) {
      const merged = { ...current[group], ...(req.body || {}) };
      await collection('settings').updateOne({ _id: current._id }, { [group]: merged }, { upsert: true });
    } else {
      const patch = {};
      Object.keys(req.body || {}).forEach((k) => { patch[k] = req.body[k]; });
      await collection('settings').updateOne({ _id: current._id }, patch, { upsert: true });
    }
    maintenance.invalidate();
    emitEvent('settings:updated', { action: 'update', group });
    return res.json(await getSettingsDoc());
  } catch (e) { return next(e); }
};

exports.testEmail = async (req, res, next) => {
  try {
    const transport = await getTransport(true);
    if (!transport) return res.status(400).json({ message: 'إعدادات SMTP غير مكتملة' });
    const s = await getSettingsDoc();
    const to = req.body.to || s.notifications.email || s.email || req.user.email;
    const result = await sendMail({
      to,
      subject: 'بريد تجريبي من لوحة التحكم',
      html: layout({ title: 'إعدادات البريد تعمل بنجاح ✅', siteName: s.siteName, body: `<p>تم إرسال هذه الرسالة للتأكد من صحة إعدادات SMTP.</p><p>الوقت: ${new Date().toLocaleString('ar')}</p>` }),
    });
    if (!result.sent) return res.status(400).json({ message: `فشل الإرسال: ${result.reason}` });
    return res.json({ message: `تم إرسال البريد التجريبي إلى ${to}` });
  } catch (e) { return next(e); }
};

exports.withDefaults = withDefaults;
