const { saveBuffer, removeFile, cloudinaryEnabled } = require('../lib/storage');

exports.single = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'لم يتم اختيار ملف' });
    const folder = (req.body.folder || req.query.folder || 'general').replace(/[^a-z0-9-_]/gi, '');
    const saved = await saveBuffer(req.file.buffer, req.file.originalname, req.file.mimetype, folder || 'general');
    return res.status(201).json(saved);
  } catch (e) { return next(e); }
};

exports.multiple = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ message: 'لم يتم اختيار ملفات' });
    const folder = (req.body.folder || req.query.folder || 'general').replace(/[^a-z0-9-_]/gi, '');
    const out = [];
    for (const f of req.files) out.push(await saveBuffer(f.buffer, f.originalname, f.mimetype, folder || 'general'));
    return res.status(201).json({ files: out });
  } catch (e) { return next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const { publicId, resourceType } = req.body;
    await removeFile(publicId, resourceType || 'image');
    return res.json({ message: 'تم حذف الملف' });
  } catch (e) { return next(e); }
};

exports.info = (req, res) => res.json({ provider: cloudinaryEnabled() ? 'cloudinary' : 'local' });
