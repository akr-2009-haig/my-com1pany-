const crud = require('./factory');
module.exports = crud('faqs', {
  event: 'faq:updated',
  searchFields: ['question', 'answer'],
  filters: ['category', { key: 'isActive', cast: 'boolean' }, { key: 'showOnPricing', cast: 'boolean' }],
  populate: ['category'],
});
