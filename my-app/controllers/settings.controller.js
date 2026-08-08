
const Settings=require('../models/Settings');
const emit=require('../events/emitEvent');
exports.getAll=async(req,res,next)=>{ try{ let s=await Settings.findOne(); if(!s) s=await Settings.create({}); res.json(s);}catch(e){next(e)} };
exports.getOne=exports.getAll;
exports.create=async(req,res,next)=>{ try{ let s=await Settings.findOne(); if(s) s=await Settings.findByIdAndUpdate(s._id, req.body,{new:true}); else s=await Settings.create(req.body); emit('settings:updated',s); res.json(s);}catch(e){next(e)} };
exports.update=async(req,res,next)=>{ try{ let s=await Settings.findOne(); if(!s) s=await Settings.create(req.body); else s=await Settings.findByIdAndUpdate(s._id, req.body,{new:true}); emit('settings:updated',s); res.json(s);}catch(e){next(e)} };
exports.remove=async(req,res,next)=>{ res.status(405).json({message:"Not allowed"}); };
