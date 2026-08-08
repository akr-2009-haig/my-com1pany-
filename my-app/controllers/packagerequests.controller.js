const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { cleanText } = require('../lib/helpers');
const { notifyAdmin } = require('../lib/mailer');
const emitEvent = require('../events/emitEvent');

const base = crud('packagerequests', {
  event: 'packagerequests:updated',
  searchFields: ['name', 'email', 'packageName'],
  filters: ['status', { key: 'isRead', cast: 'boolean' }],
  defaultSort: { createdAt: -1 },
  exportColumns: [
    { key: 'name', label: 'الاسم' }, { key: 'email', label: 'البريد' }, { key: 'phone', label: 'الهاتف' },
    { key: 'packageName', label: 'الباقة' }, { key: 'billing', label: 'الدورة' },
    { key: 'status', label: 'الحالة' }, { key: 'createdAt', label: 'التاريخ' },
  ],
});

base.submit = async (req, res, next) => {
  try {
    const b = req.body;
    if (b.website) return res.json({ message: 'تم الاستلام' });
    if (!b.name || !b.email || !b.packageId) return res.status(400).json({ message: 'بيانات ناقصة' });
    const pkg = await collection('packages').findById(b.packageId);
    const doc = await collection('packagerequests').create({
      name: cleanText(b.name, 100),
      email: cleanText(b.email, 120),
      phone: cleanText(b.phone, 40),
      company: cleanText(b.company, 120),
      packageId: String(b.packageId),
      packageName: pkg?.name || '',
      billing: b.billing === 'yearly' ? 'yearly' : 'monthly',
      message: cleanText(b.message, 3000),
    });
    emitEvent('packagerequests:updated', { action: 'create', data: doc });
    notifyAdmin('packageRequest', {
      title: 'طلب اشتراك بباقة',
      data: { الاسم: doc.name, البريد: doc.email, الباقة: doc.packageName, الدورة: doc.billing },
      link: '/Akramadmin/package-requests',
    }).catch(() => {});
    return res.status(201).json({ message: 'تم استلام طلبك، سنتواصل معك قريباً' });
  } catch (e) { return next(e); }
};

module.exports = base;
