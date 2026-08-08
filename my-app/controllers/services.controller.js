const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { cleanHtml } = require('../lib/helpers');

const base = crud('services', {
  event: 'services:updated',
  searchFields: ['title', 'shortDesc', 'slug'],
  filters: [{ key: 'isActive', cast: 'boolean' }, { key: 'isFeatured', cast: 'boolean' }, 'status'],
  slugFrom: 'title',
  slugFallback: 'service',
  transformIn: (body) => ({
    ...body,
    description: cleanHtml(body.description),
    descriptionEn: cleanHtml(body.descriptionEn),
    features: Array.isArray(body.features) ? body.features.filter((f) => f && (f.text || '').trim()) : [],
    technologies: Array.isArray(body.technologies) ? body.technologies.filter((t) => t && t.name) : [],
  }),
});

/** Public single-service payload: service + related projects + sibling list. */
base.publicOne = async (req, res, next) => {
  try {
    const service = await collection('services').findOne({ slug: req.params.slug, isActive: true, status: 'published' });
    if (!service) return res.status(404).json({ message: 'الخدمة غير موجودة' });
    await collection('services').increment(service._id, 'views', 1);
    const all = await collection('services').find({ isActive: true, status: 'published' }, { sort: { order: 1 }, limit: 0 });
    const projects = await collection('projects').find(
      { isActive: true, status: 'published' },
      { sort: { order: 1 }, limit: 3, populate: ['category'] },
    );
    return res.json({ service, siblings: all.map((s) => ({ _id: s._id, title: s.title, slug: s.slug })), projects });
  } catch (e) { return next(e); }
};

module.exports = base;
