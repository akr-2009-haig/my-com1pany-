const nodemailer = require('nodemailer');
const { collection } = require('./datastore');
const { settingsDefaults } = require('./schemas');

let cachedTransport = null;
let cachedKey = '';

async function getSmtpConfig() {
  const s = await collection('settings').findOne({});
  return { ...settingsDefaults.smtp, ...(s?.smtp || {}) };
}

async function getTransport(force = false) {
  const cfg = await getSmtpConfig();
  if (!cfg.host || !cfg.user) return null;
  const key = JSON.stringify(cfg);
  if (!force && cachedTransport && cachedKey === key) return cachedTransport;
  cachedTransport = nodemailer.createTransport({
    host: cfg.host,
    port: Number(cfg.port) || 587,
    secure: cfg.encryption === 'ssl' || Number(cfg.port) === 465,
    auth: { user: cfg.user, pass: cfg.pass },
    tls: { rejectUnauthorized: false },
  });
  cachedKey = key;
  return cachedTransport;
}

function layout({ title, body, siteName = '', primary = '#00BCD4' }) {
  return `<!doctype html><html dir="rtl" lang="ar"><body style="margin:0;background:#f0f2f5;font-family:Tahoma,Arial,sans-serif;color:#333">
  <div style="max-width:620px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">
    <div style="background:${primary};padding:20px 24px;color:#fff;font-size:18px;font-weight:bold">${siteName || 'إشعار جديد'}</div>
    <div style="padding:24px">
      <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a2e">${title}</h2>
      <div style="font-size:14px;line-height:1.9;color:#555">${body}</div>
    </div>
    <div style="padding:14px 24px;background:#fafbfc;color:#999;font-size:12px;text-align:center">
      رسالة آلية من لوحة تحكم ${siteName || 'الموقع'}
    </div>
  </div></body></html>`;
}

function rows(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `<tr><td style="padding:8px 10px;background:#f7f9fa;font-weight:bold;width:150px;border-bottom:1px solid #eee">${k}</td><td style="padding:8px 10px;border-bottom:1px solid #eee">${String(v).replace(/</g, '&lt;')}</td></tr>`)
    .join('');
}

async function sendMail({ to, subject, html, text, replyTo, attachments }) {
  const transport = await getTransport();
  if (!transport) return { sent: false, reason: 'SMTP not configured' };
  const cfg = await getSmtpConfig();
  const settings = await collection('settings').findOne({});
  try {
    const info = await transport.sendMail({
      from: `"${cfg.fromName || settings?.siteName || 'Website'}" <${cfg.fromEmail || cfg.user}>`,
      to: to || cfg.fromEmail || cfg.user,
      subject,
      html,
      text,
      replyTo,
      attachments,
    });
    return { sent: true, messageId: info.messageId };
  } catch (e) {
    console.error('[mailer] send failed:', e.message);
    return { sent: false, reason: e.message };
  }
}

/**
 * Fire-and-forget notification for a new lead / comment.
 * Respects the notification toggles saved in settings.
 */
async function notifyAdmin(kind, { title, data, link }) {
  const settings = await collection('settings').findOne({});
  const notif = { ...settingsDefaults.notifications, ...(settings?.notifications || {}) };
  const flagMap = {
    message: 'onMessage', quote: 'onQuote', packageRequest: 'onPackage',
    application: 'onApplication', comment: 'onComment',
  };
  const flag = flagMap[kind];
  if (flag && notif[flag] === false) return { sent: false, reason: 'disabled' };

  await collection('notifications').create({
    type: kind, title, body: Object.values(data || {}).slice(0, 2).join(' — '), link, meta: data,
  }).catch(() => {});

  if (!notif.emailCopy) return { sent: false, reason: 'email copy disabled' };
  const to = notif.email || settings?.email;
  if (!to) return { sent: false, reason: 'no recipient' };
  return sendMail({
    to,
    subject: title,
    html: layout({ title, siteName: settings?.siteName, body: `<table style="width:100%;border-collapse:collapse">${rows(data || {})}</table>${link ? `<p style="margin-top:18px"><a href="${link}" style="background:#00BCD4;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">فتح في لوحة التحكم</a></p>` : ''}` }),
  });
}

module.exports = { sendMail, notifyAdmin, getTransport, layout, rows };
