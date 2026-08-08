const crud = require('./factory');
module.exports = crud('partners', {
  event: 'partners:updated',
  searchFields: ['name'],
  filters: [{ key: 'isActive', cast: 'boolean' }],
});
