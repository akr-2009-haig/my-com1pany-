const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { cleanHtml } = require('../lib/helpers');

const base = crud('projects', {
  event: 'projects:updated',
  searchFields: ['title', 'client', 'slug'],
  filters: ['category', { key: 'isActive', cast: 'boolean' }, { key: 'isFeatured', cast: 'boolean' }, 'status'],
  populate: ['category'],
  slugFrom: 'title',
  slugFallback: 'project',
  transformIn: (body) => ({
    ...body,
    description: cleanHtml(body.description),
    descriptionEn: cleanHtml(body.descriptionEn),
    images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],
    technologies: Array.isArray(body.technologies) ? body.technologies.filter(Boolean) : [],
    cover: body.cover || (Array.isArray(body.images) && body.images[0]) || '',
  }),
});

base.publicOne = async (req, res, next) => {
  try {
    const project = await collection('projects').findOne(
      { slug: req.params.slug, isActive: true, status: 'published' },
      { populate: ['category'] },
    );
    if (!project) return res.status(404).json({ message: 'المشروع غير موجود' });
    await collection('projects').increment(project._id, 'views', 1);
    const related = await collection('projects').find(
      { isActive: true, status: 'published', category: project.category?._id || project.category, _id: { $ne: project._id } },
      { limit: 3, populate: ['category'] },
    );
    return res.json({ project, related });
  } catch (e) { return next(e); }
};

module.exports = base;
