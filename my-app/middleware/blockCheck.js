const BlockedIp=require('../models/BlockedIp');
const mongoose=require('mongoose');
async function blockCheck(req,res,next){
  if(req.path==='/api/health') return next();
  if(mongoose.connection.readyState!==1) return next();
  const ip=req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  try{
    const blocked=await BlockedIp.findOne({ip}).maxTimeMS(2000);
    if(blocked){
      if(blocked.expiresAt && new Date(blocked.expiresAt) < new Date()){
        await BlockedIp.deleteOne({ip}).catch(()=>{});
      } else {
        return res.status(403).json({message:'Your IP has been blocked. Contact admin.'});
      }
    }
  }catch(e){}
  next();
}
module.exports=blockCheck;
