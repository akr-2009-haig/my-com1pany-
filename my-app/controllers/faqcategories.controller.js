const crud = require('./factory');
module.exports = crud('faqcategories', {
  event: 'faq:updated',
  searchFields: ['name'],
  slugFrom: 'name',
  slugFallback: 'faq-cat',
});
