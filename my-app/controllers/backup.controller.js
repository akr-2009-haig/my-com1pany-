const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { collection, dumpAll, restoreAll, getDriver } = require('../lib/datastore');

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'data', 'backups');

function ensureDir() { fs.mkdirSync(BACKUP_DIR, { recursive: true }); }

exports.list = async (req, res, next) => {
  try {
    ensureDir();
    const rows = await collection('backups').find({}, { sort: { createdAt: -1 }, limit: 0 });
    const data = rows.map((b) => ({ ...b, exists: fs.existsSync(path.join(BACKUP_DIR, b.filename)) }));
    res.json({ data, driver: getDriver(), dir: BACKUP_DIR });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    ensureDir();
    const dump = await dumpAll();
    const payload = JSON.stringify({ version: 1, createdAt: new Date().toISOString(), data: dump });
    const gz = zlib.gzipSync(Buffer.from(payload, 'utf8'));
    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json.gz`;
    fs.writeFileSync(path.join(BACKUP_DIR, filename), gz);
    const documents = Object.values(dump).reduce((a, arr) => a + arr.length, 0);
    const doc = await collection('backups').create({
      filename, size: gz.length, type: req.body.type === 'auto' ? 'auto' : 'manual',
      collections: Object.keys(dump).length, documents, note: req.body.note || '',
    });
    await exports.rotate();
    return res.status(201).json(doc);
  } catch (e) { return next(e); }
};

exports.download = async (req, res, next) => {
  try {
    const doc = await collection('backups').findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'النسخة غير موجودة' });
    const file = path.join(BACKUP_DIR, doc.filename);
    if (!fs.existsSync(file)) return res.status(404).json({ message: 'ملف النسخة مفقود على الخادم' });
    return res.download(file, doc.filename);
  } catch (e) { return next(e); }
};

exports.restore = async (req, res, next) => {
  try {
    let payload = null;
    if (req.file) {
      const raw = req.file.originalname.endsWith('.gz') ? zlib.gunzipSync(req.file.buffer) : req.file.buffer;
      payload = JSON.parse(raw.toString('utf8'));
    } else {
      const doc = await collection('backups').findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'النسخة غير موجودة' });
      const file = path.join(BACKUP_DIR, doc.filename);
      if (!fs.existsSync(file)) return res.status(404).json({ message: 'ملف النسخة مفقود' });
      payload = JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString('utf8'));
    }
    if (!payload || !payload.data) return res.status(400).json({ message: 'ملف النسخة غير صالح' });
    await restoreAll(payload.data, { skipUsers: req.body.keepUsers === 'true' || req.body.keepUsers === true });
    return res.json({ message: 'تمت استعادة النسخة الاحتياطية بنجاح' });
  } catch (e) { return next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const doc = await collection('backups').findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'النسخة غير موجودة' });
    const file = path.join(BACKUP_DIR, doc.filename);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    await collection('backups').deleteById(req.params.id);
    return res.json({ message: 'تم حذف النسخة' });
  } catch (e) { return next(e); }
};

/** Keeps only the configured number of backups. */
exports.rotate = async () => {
  const settings = await collection('settings').findOne({});
  const keep = Number(settings?.backup?.keep) || 10;
  const all = await collection('backups').find({}, { sort: { createdAt: -1 }, limit: 0 });
  for (const old of all.slice(keep)) {
    const file = path.join(BACKUP_DIR, old.filename);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    await collection('backups').deleteById(old._id);
  }
};

/** Scheduled automatic backups. */
exports.startScheduler = () => {
  const HOUR = 60 * 60 * 1000;
  setInterval(async () => {
    try {
      const settings = await collection('settings').findOne({});
      const cfg = settings?.backup || {};
      if (!cfg.autoEnabled) return;
      const intervals = { daily: 24 * HOUR, weekly: 7 * 24 * HOUR, monthly: 30 * 24 * HOUR };
      const every = intervals[cfg.frequency] || intervals.weekly;
      const last = (await collection('backups').find({ type: 'auto' }, { sort: { createdAt: -1 }, limit: 1 }))[0];
      if (last && Date.now() - new Date(last.createdAt).getTime() < every) return;
      ensureDir();
      const dump = await dumpAll();
      const gz = zlib.gzipSync(Buffer.from(JSON.stringify({ version: 1, createdAt: new Date().toISOString(), data: dump }), 'utf8'));
      const filename = `backup-auto-${new Date().toISOString().replace(/[:.]/g, '-')}.json.gz`;
      fs.writeFileSync(path.join(BACKUP_DIR, filename), gz);
      await collection('backups').create({
        filename, size: gz.length, type: 'auto',
        collections: Object.keys(dump).length,
        documents: Object.values(dump).reduce((a, arr) => a + arr.length, 0),
      });
      await exports.rotate();
      console.log('[backup] automatic backup created:', filename);
    } catch (e) { console.error('[backup] scheduler error:', e.message); }
  }, HOUR);
};

exports.BACKUP_DIR = BACKUP_DIR;
