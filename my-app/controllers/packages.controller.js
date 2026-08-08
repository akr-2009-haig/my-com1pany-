const crud = require('./factory');
module.exports = crud('packages', {
  event: 'packages:updated',
  searchFields: ['name'],
  filters: [{ key: 'isActive', cast: 'boolean' }, { key: 'isPopular', cast: 'boolean' }],
  slugFrom: 'name',
  slugFallback: 'package',
  transformIn: (body) => ({
    ...body,
    monthlyPrice: Number(body.monthlyPrice) || 0,
    yearlyPrice: Number(body.yearlyPrice) || 0,
    features: Array.isArray(body.features)
      ? body.features.filter((f) => f && (f.text || '').trim()).map((f) => ({ text: f.text, included: f.included !== false }))
      : [],
  }),
});
