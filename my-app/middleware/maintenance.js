const Settings=require('../models/Settings');
const mongoose=require('mongoose');
async function maintenanceCheck(req,res,next){
  if(req.path.startsWith('/api') || req.path.startsWith('/Akramadmin')) return next();
  if(mongoose.connection.readyState!==1) return next();
  try{
    const s=await Settings.findOne().maxTimeMS(2000);
    if(s && s.maintenance && s.maintenance.enabled){
      const isAdmin = req.headers.authorization || (req.cookies && req.cookies.token);
      if(!isAdmin){
        return res.status(503).send(`<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>${s.maintenance.title||'تحت الصيانة'}</title><style>body{font-family:system-ui;background:#f0f2f5;display:grid;place-items:center;min-height:100vh;text-align:center}</style></head><body><div><h1>${s.maintenance.title||'الموقع تحت الصيانة'}</h1><p>${s.maintenance.message||'نعمل على تحسين الموقع، سنعود قريبا.'}</p></div></body></html>`);
      }
    }
  }catch(e){}
  next();
}
module.exports=maintenanceCheck;
