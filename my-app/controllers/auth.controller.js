const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { UAParser } = require('ua-parser-js');
const { collection } = require('../lib/datastore');
const { signToken, loadUser } = require('../middleware/auth');
const { clientIp, cleanText } = require('../lib/helpers');
const { sendMail, layout } = require('../lib/mailer');
const { settingsDefaults } = require('../lib/schemas');
const blockCheck = require('../middleware/blockCheck');

const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

function passwordIssues(p = '') {
  const issues = [];
  if (p.length < 8) issues.push('8 أحرف على الأقل');
  if (!/[a-z]/.test(p)) issues.push('حرف صغير');
  if (!/[A-Z]/.test(p)) issues.push('حرف كبير');
  if (!/[0-9]/.test(p)) issues.push('رقم');
  return issues;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

async function securityConfig() {
  const s = await collection('settings').findOne({});
  return { ...settingsDefaults.security, ...(s?.security || {}) };
}

async function logLogin(req, { email, status, reason, userId }) {
  const ua = new UAParser(req.headers['user-agent'] || '');
  await collection('loginlogs').create({
    user: userId || null,
    email,
    status,
    reason: reason || '',
    ip: clientIp(req),
    browser: `${ua.getBrowser().name || 'Unknown'} ${ua.getBrowser().version || ''}`.trim(),
    os: `${ua.getOS().name || 'Unknown'} ${ua.getOS().version || ''}`.trim(),
    device: ua.getDevice().type || 'desktop',
    userAgent: req.headers['user-agent'] || '',
  }).catch(() => {});
}

exports.login = async (req, res, next) => {
  const ip = clientIp(req);
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const { password, remember } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبان' });

    const cfg = await securityConfig();
    const maxAttempts = Number(cfg.maxAttempts) || 5;
    const windowStart = new Date(Date.now() - 15 * 60 * 1000);
    const fails = await collection('loginlogs').count({ ip, status: 'failed', createdAt: { $gte: windowStart } });
    if (fails >= maxAttempts) {
      const minutes = Number(cfg.blockDuration) || 30;
      await collection('blockedips').updateOne(
        { ip },
        { ip, reason: 'محاولات دخول فاشلة متكررة', expiresAt: new Date(Date.now() + minutes * 60 * 1000), permanent: false },
        { upsert: true },
      );
      blockCheck.invalidate(ip);
      await logLogin(req, { email, status: 'failed', reason: 'IP blocked' });
      return res.status(429).json({ message: `تم حظر عنوانك مؤقتاً لمدة ${minutes} دقيقة بسبب المحاولات المتكررة` });
    }

    const user = await collection('users').findOne(
      { $or: [{ email }, { username: email }] },
      { withHidden: true },
    );
    if (!user) {
      await logLogin(req, { email, status: 'failed', reason: 'المستخدم غير موجود' });
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة', attemptsLeft: maxAttempts - fails - 1 });
    }
    if (user.isActive === false) {
      await logLogin(req, { email, status: 'failed', reason: 'حساب معطل', userId: user._id });
      return res.status(403).json({ message: 'تم تعطيل هذا الحساب' });
    }
    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) {
      await logLogin(req, { email, status: 'failed', reason: 'كلمة مرور خاطئة', userId: user._id });
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة', attemptsLeft: maxAttempts - fails - 1 });
    }

    // Optional second factor (email code)
    if (user.twoFactorEnabled) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await collection('users').updateById(user._id, {
        twoFactorSecret: await bcrypt.hash(code, 8),
        resetTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
      });
      const settings = await collection('settings').findOne({});
      await sendMail({
        to: user.email,
        subject: 'رمز التحقق الثنائي',
        html: layout({ title: 'رمز الدخول', siteName: settings?.siteName, body: `<p>رمز التحقق الخاص بك هو:</p><h1 style="letter-spacing:8px">${code}</h1><p>صالح لمدة 10 دقائق.</p>` }),
      });
      return res.json({ twoFactorRequired: true, userId: String(user._id), message: 'تم إرسال رمز التحقق إلى بريدك' });
    }

    await collection('users').updateById(user._id, { lastLogin: new Date() });
    await logLogin(req, { email, status: 'success', userId: user._id });
    await collection('activitylogs').create({
      user: String(user._id), userName: user.name || user.email, action: 'تسجيل دخول',
      module: 'auth', details: 'دخول ناجح', ip, userAgent: req.headers['user-agent'] || '',
    }).catch(() => {});

    const token = signToken(user);
    res.cookie('token', token, { ...cookieOptions(), maxAge: remember ? 30 * 24 * 3600 * 1000 : 7 * 24 * 3600 * 1000 });
    const profile = await loadUser({ id: user._id });
    return res.json({ token, user: profile });
  } catch (e) { return next(e); }
};

exports.verifyTwoFactor = async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    const user = await collection('users').findById(userId, { withHidden: true });
    if (!user || !user.twoFactorSecret) return res.status(400).json({ message: 'طلب غير صالح' });
    if (user.resetTokenExpires && new Date(user.resetTokenExpires) < new Date()) {
      return res.status(400).json({ message: 'انتهت صلاحية الرمز' });
    }
    const ok = await bcrypt.compare(String(code || ''), user.twoFactorSecret);
    if (!ok) {
      await logLogin(req, { email: user.email, status: 'failed', reason: 'رمز 2FA خاطئ', userId: user._id });
      return res.status(401).json({ message: 'الرمز غير صحيح' });
    }
    await collection('users').updateById(user._id, { twoFactorSecret: '', resetTokenExpires: null, lastLogin: new Date() });
    await logLogin(req, { email: user.email, status: 'success', userId: user._id });
    const token = signToken(user);
    res.cookie('token', token, cookieOptions());
    const profile = await loadUser({ id: user._id });
    return res.json({ token, user: profile });
  } catch (e) { return next(e); }
};

exports.me = async (req, res) => res.json(req.user);

exports.logout = async (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'تم تسجيل الخروج' });
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await collection('users').findById(req.user.id, { withHidden: true });
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    const ok = await bcrypt.compare(currentPassword || '', user.password || '');
    if (!ok) return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
    const issues = passwordIssues(newPassword || '');
    if (issues.length) return res.status(400).json({ message: `كلمة المرور ضعيفة، يجب أن تحتوي: ${issues.join('، ')}` });
    await collection('users').updateById(user._id, { password: await bcrypt.hash(newPassword, ROUNDS) });
    await collection('activitylogs').create({
      user: String(user._id), userName: user.name, action: 'تغيير كلمة المرور', module: 'auth', ip: clientIp(req),
    }).catch(() => {});
    return res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (e) { return next(e); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, username, avatar, phone, bio, twoFactorEnabled } = req.body;
    const patch = {};
    if (name) patch.name = cleanText(name, 100);
    if (email) patch.email = String(email).toLowerCase().trim();
    if (username !== undefined) patch.username = cleanText(username, 60);
    if (avatar !== undefined) patch.avatar = avatar;
    if (phone !== undefined) patch.phone = cleanText(phone, 40);
    if (bio !== undefined) patch.bio = cleanText(bio, 500);
    if (twoFactorEnabled !== undefined) patch.twoFactorEnabled = Boolean(twoFactorEnabled);
    if (patch.email) {
      const dup = await collection('users').findOne({ email: patch.email });
      if (dup && String(dup._id) !== String(req.user.id)) return res.status(409).json({ message: 'البريد مستخدم بالفعل' });
    }
    await collection('users').updateById(req.user.id, patch);
    const profile = await loadUser({ id: req.user.id });
    return res.json({ message: 'تم حفظ الملف الشخصي', user: profile });
  } catch (e) { return next(e); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const user = await collection('users').findOne({ email });
    // never reveal whether the account exists
    const generic = { message: 'إذا كان البريد مسجلاً لدينا فسيصلك رابط إعادة التعيين' };
    if (!user) return res.json(generic);
    const raw = crypto.randomBytes(32).toString('hex');
    await collection('users').updateById(user._id, {
      resetToken: crypto.createHash('sha256').update(raw).digest('hex'),
      resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
    });
    const settings = await collection('settings').findOne({});
    const base = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
    const link = `${base}/Akramadmin/reset-password?token=${raw}&email=${encodeURIComponent(email)}`;
    await sendMail({
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      html: layout({
        title: 'إعادة تعيين كلمة المرور',
        siteName: settings?.siteName,
        body: `<p>اضغط الزر أدناه لتعيين كلمة مرور جديدة. الرابط صالح لمدة ساعة واحدة.</p>
               <p style="margin-top:18px"><a href="${link}" style="background:#00BCD4;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none">إعادة تعيين كلمة المرور</a></p>
               <p style="margin-top:18px;font-size:12px;color:#999">إذا لم تطلب ذلك تجاهل هذه الرسالة.</p>`,
      }),
    });
    return res.json(generic);
  } catch (e) { return next(e); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) return res.status(400).json({ message: 'بيانات ناقصة' });
    const issues = passwordIssues(password);
    if (issues.length) return res.status(400).json({ message: `كلمة المرور ضعيفة، يجب أن تحتوي: ${issues.join('، ')}` });
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await collection('users').findOne({ email: String(email).toLowerCase(), resetToken: hashed }, { withHidden: true });
    if (!user || !user.resetTokenExpires || new Date(user.resetTokenExpires) < new Date()) {
      return res.status(400).json({ message: 'الرابط غير صالح أو منتهي الصلاحية' });
    }
    await collection('users').updateById(user._id, {
      password: await bcrypt.hash(password, ROUNDS), resetToken: '', resetTokenExpires: null,
    });
    return res.json({ message: 'تم تعيين كلمة المرور، يمكنك الدخول الآن' });
  } catch (e) { return next(e); }
};

exports.passwordIssues = passwordIssues;
