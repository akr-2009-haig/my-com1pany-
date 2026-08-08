const crud = require('./factory');
module.exports = crud('stats', {
  event: 'stats:updated',
  searchFields: ['label'],
  filters: [{ key: 'isActive', cast: 'boolean' }],
});
