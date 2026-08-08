const crud = require('./factory');
module.exports = crud('slides', {
  event: 'slides:updated',
  searchFields: ['title', 'subtitle'],
  filters: [{ key: 'isActive', cast: 'boolean' }],
});
