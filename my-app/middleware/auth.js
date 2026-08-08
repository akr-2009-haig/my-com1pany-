const jwt=require('jsonwebtoken');
const BlockedIp=require('../models/BlockedIp');

function getToken(req){
  const h=req.headers.authorization||req.headers.Authorization;
  if(h && h.startsWith('Bearer ')) return h.split(' ')[1];
  if(req.cookies && req.cookies.token) return req.cookies.token;
  return null;
}
async function verifyToken(req,res,next){
  // IP block early
  const ip=req.ip;
  try{
    const blk=await BlockedIp.findOne({ip});
    if(blk && (!blk.expiresAt || new Date(blk.expiresAt) > new Date())){
      return res.status(403).json({message:'IP blocked'});
    }
  }catch(e){}
  const token=getToken(req);
  if(!token) return res.status(401).json({message:'Unauthorized'});
  try{
    const decoded=jwt.verify(token, process.env.JWT_SECRET||'secret');
    req.user=decoded;
    // check user still active? load fresh if needed
    next();
  }catch(e){
    return res.status(401).json({message:'Invalid or expired token'});
  }
}
function authorize(...roles){
  return (req,res,next)=>{
    if(!req.user) return res.status(401).json({message:'Unauthorized'});
    if(roles.length && !roles.includes(req.user.role)) return res.status(403).json({message:'Forbidden: insufficient role'});
    next();
  }
}
function optionalAuth(req,res,next){
  const token=getToken(req);
  if(token){
    try{ req.user=jwt.verify(token, process.env.JWT_SECRET||'secret'); }catch(e){}
  }
  next();
}
module.exports={verifyToken,authorize,optionalAuth, getToken};
