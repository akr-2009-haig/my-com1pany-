const crud = require('./factory');
module.exports = crud('timeline', {
  event: 'timeline:updated',
  searchFields: ['year', 'title'],
  filters: [{ key: 'isActive', cast: 'boolean' }],
  defaultSort: { order: 1, year: 1 },
});
