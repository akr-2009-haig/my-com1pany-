const jwt = require('jsonwebtoken');
const { collection } = require('../lib/datastore');
const { can } = require('../lib/permissions');

function getToken(req) {
  const h = req.headers.authorization || req.headers.Authorization;
  if (h && h.startsWith('Bearer ')) return h.slice(7);
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
}

function jwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.includes('CHANGE_ME')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set to a strong random value in production');
    }
    return 'dev-only-insecure-secret-change-me';
  }
  return s;
}

function signToken(user) {
  return jwt.sign(
    { id: String(user._id), role: user.role, email: user.email, name: user.name },
    jwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

/** Loads the user + role permissions and attaches them to req.user. */
async function loadUser(decoded) {
  const user = await collection('users').findById(decoded.id);
  if (!user || user.isActive === false) return null;
  const role = await collection('roles').findOne({ slug: user.role });
  return {
    id: String(user._id),
    _id: String(user._id),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    roleName: role?.name || user.role,
    permissions: role?.permissions || {},
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

async function verifyToken(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'يجب تسجيل الدخول' });
  try {
    const decoded = jwt.verify(token, jwtSecret());
    const user = await loadUser(decoded);
    if (!user) return res.status(401).json({ message: 'الحساب غير موجود أو معطّل' });
    req.user = user;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'الجلسة منتهية، يرجى تسجيل الدخول من جديد' });
  }
}

async function optionalAuth(req, res, next) {
  const token = getToken(req);
  if (token) {
    try {
      req.user = await loadUser(jwt.verify(token, jwtSecret()));
    } catch (e) { /* anonymous */ }
  }
  return next();
}

/** Role-based guard. */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'يجب تسجيل الدخول' });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ليس لديك صلاحية للوصول لهذا القسم' });
    }
    return next();
  };
}

/** Fine-grained permission guard: requirePermission('services', 'create') */
function requirePermission(moduleKey, action = 'view') {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'يجب تسجيل الدخول' });
    if (!can(req.user, moduleKey, action)) {
      return res.status(403).json({ message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء' });
    }
    return next();
  };
}

module.exports = { verifyToken, optionalAuth, authorize, requirePermission, signToken, getToken, jwtSecret, loadUser };
