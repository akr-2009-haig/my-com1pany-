const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { cleanText } = require('../lib/helpers');
const { saveBuffer } = require('../lib/storage');
const { notifyAdmin } = require('../lib/mailer');
const emitEvent = require('../events/emitEvent');

const base = crud('applications', {
  event: 'applications:updated',
  searchFields: ['name', 'email', 'jobTitle'],
  filters: ['status', 'job', { key: 'isRead', cast: 'boolean' }],
  defaultSort: { createdAt: -1 },
  exportColumns: [
    { key: 'name', label: 'الاسم' }, { key: 'email', label: 'البريد' }, { key: 'phone', label: 'الهاتف' },
    { key: 'jobTitle', label: 'الوظيفة' }, { key: 'status', label: 'الحالة' },
    { key: 'resume', label: 'السيرة الذاتية' }, { key: 'createdAt', label: 'التاريخ' },
  ],
});

/** Public application submission (multipart: resume file). */
base.submit = async (req, res, next) => {
  try {
    const { jobId, name, email, phone, coverLetter, portfolioUrl, website } = req.body;
    if (website) return res.json({ message: 'تم الاستلام' });
    if (!jobId || !name || !email) return res.status(400).json({ message: 'الاسم والبريد والوظيفة مطلوبة' });
    const job = await collection('jobs').findById(jobId);
    if (!job || !job.isActive) return res.status(404).json({ message: 'الوظيفة غير متاحة' });

    let resume = ''; let resumeName = '';
    if (req.file) {
      const saved = await saveBuffer(req.file.buffer, req.file.originalname, req.file.mimetype, 'resumes');
      resume = saved.url; resumeName = saved.name;
    }
    const doc = await collection('applications').create({
      job: String(job._id),
      jobTitle: job.title,
      name: cleanText(name, 100),
      email: cleanText(email, 120),
      phone: cleanText(phone, 40),
      coverLetter: cleanText(coverLetter, 4000),
      portfolioUrl: cleanText(portfolioUrl, 300),
      resume,
      resumeName,
      status: 'new',
    });
    await collection('jobs').increment(job._id, 'applicationsCount', 1);
    emitEvent('applications:updated', { action: 'create', data: doc });
    notifyAdmin('application', {
      title: `طلب توظيف جديد: ${job.title}`,
      data: { الاسم: doc.name, البريد: doc.email, الهاتف: doc.phone, الوظيفة: job.title },
      link: '/Akramadmin/jobs/applications',
    }).catch(() => {});
    return res.status(201).json({ message: 'تم إرسال طلبك بنجاح، سنتواصل معك قريباً' });
  } catch (e) { return next(e); }
};

module.exports = base;
