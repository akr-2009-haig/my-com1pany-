
const ContactMessage=require('../models/ContactMessage');
const emit=require('../events/emitEvent');
exports.getAll=async(req,res,next)=>{ try{ const data=await ContactMessage.find().sort({createdAt:-1}); res.json(data);}catch(e){next(e)} };
exports.getOne=async(req,res,next)=>{ try{ const d=await ContactMessage.findById(req.params.id); res.json(d);}catch(e){next(e)} };
exports.create=async(req,res,next)=>{ try{ const doc=await ContactMessage.create(req.body); emit('messages:updated',{action:"create"}); res.status(201).json(doc);}catch(e){next(e)} };
exports.update=async(req,res,next)=>{ try{ const doc=await ContactMessage.findByIdAndUpdate(req.params.id,req.body,{new:true}); res.json(doc);}catch(e){next(e)} };
exports.remove=async(req,res,next)=>{ try{ await ContactMessage.findByIdAndDelete(req.params.id); res.json({message:"Deleted"});}catch(e){next(e)} };
