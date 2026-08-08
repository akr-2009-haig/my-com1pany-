function notFound(req, res) {
  res.status(404).json({ message: `المسار غير موجود: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'حجم الملف كبير جداً' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'حقل ملف غير متوقع' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'القيمة مستخدمة بالفعل (تكرار)' });
  }
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'حدث خطأ في الخادم'
    : err.message || 'حدث خطأ';
  return res.status(status).json({ message });
}

module.exports = errorHandler;
module.exports.notFound = notFound;
module.exports.errorHandler = errorHandler;
