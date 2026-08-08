/**
 * File storage abstraction.
 *  - Cloudinary when credentials are present (recommended for production).
 *  - Local disk (public/uploads) otherwise, so uploads work out of the box.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function cloudinaryEnabled() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET
    && process.env.CLOUDINARY_CLOUD_NAME !== 'demo',
  );
}

let cloudinary = null;
if (cloudinaryEnabled()) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function safeName(original = 'file') {
  const parsed = path.parse(original);
  const base = parsed.name.replace(/[^a-zA-Z0-9\u0600-\u06FF-_]/g, '_').slice(0, 60) || 'file';
  return `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${base}${parsed.ext.toLowerCase()}`;
}

async function saveBuffer(buffer, originalname, mimetype, folder = 'general') {
  if (cloudinary) {
    const isRaw = !mimetype.startsWith('image/');
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `mycompany/${folder}`,
          resource_type: isRaw ? 'raw' : 'image',
          public_id: path.parse(safeName(originalname)).name,
          ...(isRaw ? {} : { transformation: [{ quality: 'auto:good', fetch_format: 'auto' }] }),
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
      stream.end(buffer);
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      provider: 'cloudinary',
      bytes: result.bytes,
      name: originalname,
    };
  }

  const dir = path.join(UPLOAD_DIR, folder);
  fs.mkdirSync(dir, { recursive: true });
  const filename = safeName(originalname);
  fs.writeFileSync(path.join(dir, filename), buffer);
  return {
    url: `/uploads/${folder}/${filename}`,
    publicId: `${folder}/${filename}`,
    provider: 'local',
    bytes: buffer.length,
    name: originalname,
  };
}

async function removeFile(publicId, resourceType = 'image') {
  if (!publicId) return false;
  if (cloudinary && !publicId.startsWith('/') && publicId.includes('mycompany/')) {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch(() => {});
    return true;
  }
  const target = path.join(UPLOAD_DIR, publicId.replace(/^\/?uploads\//, ''));
  if (target.startsWith(UPLOAD_DIR) && fs.existsSync(target)) {
    fs.unlinkSync(target);
    return true;
  }
  return false;
}

module.exports = { saveBuffer, removeFile, cloudinaryEnabled, UPLOAD_DIR };
