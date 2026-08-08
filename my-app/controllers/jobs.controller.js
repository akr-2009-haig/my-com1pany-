const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { cleanHtml } = require('../lib/helpers');

const base = crud('jobs', {
  event: 'jobs:updated',
  searchFields: ['title', 'department', 'location'],
  filters: ['department', 'type', { key: 'isActive', cast: 'boolean' }],
  slugFrom: 'title',
  slugFallback: 'job',
  transformIn: (body) => ({
    ...body,
    description: cleanHtml(body.description),
    requirements: cleanHtml(body.requirements),
    skills: cleanHtml(body.skills),
    benefits: cleanHtml(body.benefits),
  }),
});

const originalList = base.list;
base.list = async (req, res, next) => {
  const json = res.json.bind(res);
  res.json = async (body) => {
    if (body && Array.isArray(body.data)) {
      const apps = await collection('applications').find({}, { limit: 0 });
      body.data = body.data.map((j) => ({
        ...j,
        applicationsCount: apps.filter((a) => String(a.job) === String(j._id)).length,
      }));
    }
    return json(body);
  };
  return originalList(req, res, next);
};

base.publicOne = async (req, res, next) => {
  try {
    const job = await collection('jobs').findOne({ slug: req.params.slug, isActive: true });
    if (!job) return res.status(404).json({ message: 'الوظيفة غير موجودة' });
    return res.json(job);
  } catch (e) { return next(e); }
};

/* Departments are managed as a tiny standalone list. */
base.departments = crud('jobdepartments', { event: 'jobs:updated', searchFields: ['name'], slugFrom: 'name', slugFallback: 'dept' });

module.exports = base;
