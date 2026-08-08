const crud = require('./factory');
module.exports = crud('certificates', {
  event: 'certificates:updated',
  searchFields: ['title', 'issuer'],
  filters: [{ key: 'isActive', cast: 'boolean' }],
});
