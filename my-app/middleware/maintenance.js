const { collection, isReady } = require('../lib/datastore');
const { getToken } = require('./auth');

let cache = { at: 0, value: null };

async function getMaintenance() {
  if (Date.now() - cache.at < 10000) return cache.value;
  try {
    const s = await collection('settings').findOne({});
    cache = { at: Date.now(), value: s?.maintenance || null };
  } catch (e) { cache = { at: Date.now(), value: null }; }
  return cache.value;
}

function page(m, siteName = '') {
  const until = m.returnDate ? new Date(m.returnDate).toISOString() : '';
  return `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${m.title || 'الموقع تحت الصيانة'}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#f5f7fa,#e8f7f9);font-family:Cairo,system-ui,sans-serif;color:#1a1a2e;text-align:center;padding:24px}
.box{max-width:560px;background:#fff;border-radius:20px;padding:48px 32px;box-shadow:0 20px 60px rgba(0,0,0,.08)}
h1{font-size:28px;margin:0 0 12px}p{color:#666;line-height:1.9;margin:0 0 20px}
img{max-width:220px;margin-bottom:20px}
.timer{display:flex;gap:12px;justify-content:center;margin-top:24px}
.timer div{background:#00BCD4;color:#fff;border-radius:12px;padding:12px 16px;min-width:70px;font-weight:700}
.timer span{display:block;font-size:11px;font-weight:400;opacity:.85}
</style></head><body><div class="box">
${m.image ? `<img src="${m.image}" alt="">` : '<div style="font-size:64px">🛠️</div>'}
<h1>${m.title || 'الموقع تحت الصيانة'}</h1>
<p>${m.message || 'نعمل على تحسين الموقع، سنعود قريباً.'}</p>
${until ? '<div class="timer" id="t"></div>' : ''}
<p style="font-size:13px;color:#999;margin-top:24px">${siteName}</p>
</div>
${until ? `<script>const end=new Date("${until}").getTime();function u(){const d=end-Date.now();const el=document.getElementById('t');if(d<=0){el.innerHTML='<div>عدنا<span>حدّث الصفحة</span></div>';return}const s=Math.floor(d/1000),D=Math.floor(s/86400),H=Math.floor(s%86400/3600),M=Math.floor(s%3600/60),S=s%60;el.innerHTML=[[D,'يوم'],[H,'ساعة'],[M,'دقيقة'],[S,'ثانية']].map(([v,l])=>'<div>'+v+'<span>'+l+'</span></div>').join('')}u();setInterval(u,1000);</script>` : ''}
</body></html>`;
}

async function maintenanceCheck(req, res, next) {
  if (!isReady()) return next();
  const p = req.path;
  if (p.startsWith('/api') || p.startsWith('/Akramadmin') || p.startsWith('/_next')
      || p.startsWith('/uploads') || p === '/favicon.ico' || p === '/robots.txt' || p === '/sitemap.xml') {
    return next();
  }
  try {
    const m = await getMaintenance();
    if (m && m.enabled) {
      if (getToken(req)) return next(); // logged-in staff keep browsing
      const s = await collection('settings').findOne({});
      res.set('Retry-After', '3600');
      return res.status(503).send(page(m, s?.siteName || ''));
    }
  } catch (e) { /* fail open */ }
  return next();
}

maintenanceCheck.invalidate = () => { cache = { at: 0, value: null }; };
module.exports = maintenanceCheck;
