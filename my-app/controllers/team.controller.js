const crud = require('./factory');
module.exports = crud('team', {
  event: 'team:updated',
  searchFields: ['name', 'position'],
  filters: [{ key: 'isActive', cast: 'boolean' }],
});
