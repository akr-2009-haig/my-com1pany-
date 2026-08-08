const multer = require('multer');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
const DOC_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip', 'text/plain'];

function makeUploader({ types = [...IMAGE_TYPES, ...DOC_TYPES], maxSizeMb = 10, maxFiles = 12 } = {}) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeMb * 1024 * 1024, files: maxFiles },
    fileFilter: (req, file, cb) => {
      if (types.includes(file.mimetype)) return cb(null, true);
      return cb(Object.assign(new Error('نوع الملف غير مسموح به'), { status: 400 }), false);
    },
  });
}

module.exports = makeUploader();
module.exports.makeUploader = makeUploader;
module.exports.IMAGE_TYPES = IMAGE_TYPES;
module.exports.DOC_TYPES = DOC_TYPES;
module.exports.imagesOnly = makeUploader({ types: IMAGE_TYPES, maxSizeMb: 8 });
