const crud = require('./factory');
module.exports = crud('testimonials', {
  event: 'testimonials:updated',
  searchFields: ['name', 'company', 'content'],
  filters: [{ key: 'isActive', cast: 'boolean' }],
  transformIn: (body) => ({ ...body, rating: Math.min(5, Math.max(1, Number(body.rating) || 5)) }),
});
