const BlockedIp=require('../models/BlockedIp');
const LoginLog=require('../models/LoginLog');
const ActivityLog=require('../models/ActivityLog');

exports.getBlocked=async(req,res,next)=>{ try{ const data=await BlockedIp.find().sort({createdAt:-1}); res.json(data);}catch(e){next(e)} };
exports.blockIp=async(req,res,next)=>{ try{ const {ip, reason, minutes}=req.body; if(!ip) return res.status(400).json({message:'IP required'}); const expires= minutes? new Date(Date.now()+minutes*60000): null; const doc=await BlockedIp.findOneAndUpdate({ip},{ip, reason, expiresAt:expires, createdBy:req.user?.id},{upsert:true,new:true}); res.json(doc);}catch(e){next(e)} };
exports.unblockIp=async(req,res,next)=>{ try{ await BlockedIp.findByIdAndDelete(req.params.id); res.json({message:'Unblocked'});}catch(e){next(e)} };
exports.unblockByIp=async(req,res,next)=>{ try{ await BlockedIp.deleteOne({ip:req.params.ip}); res.json({message:'Unblocked'});}catch(e){next(e)} };

exports.getLoginLogs=async(req,res,next)=>{ try{ const logs=await LoginLog.find().sort({createdAt:-1}).limit(200); res.json(logs);}catch(e){next(e)} };
exports.getActivityLogs=async(req,res,next)=>{ try{ const q={}; if(req.query.user) q.userName=req.query.user; const logs=await ActivityLog.find(q).sort({createdAt:-1}).limit(200); res.json(logs);}catch(e){next(e)} };
exports.clearLogs=async(req,res,next)=>{ try{ await ActivityLog.deleteMany({}); res.json({message:'Cleared'});}catch(e){next(e)} };
