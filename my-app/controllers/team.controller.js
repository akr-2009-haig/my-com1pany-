const TeamMember=require('../models/TeamMember');
const emitEvent=require('../events/emitEvent');
exports.getAll=async(req,res,next)=>{ try{ const data=await TeamMember.find().sort({order:1,createdAt:-1}); res.json(data);}catch(e){next(e)} };
exports.getOne=async(req,res,next)=>{ try{ const doc=await TeamMember.findById(req.params.id); if(!doc) return res.status(404).json({message:"Not found"}); res.json(doc);}catch(e){next(e)} };
exports.create=async(req,res,next)=>{ try{ const doc=await TeamMember.create(req.body); emitEvent('team:updated',{action:"create",data:doc}); res.status(201).json(doc);}catch(e){next(e)} };
exports.update=async(req,res,next)=>{ try{ const doc=await TeamMember.findByIdAndUpdate(req.params.id, req.body, {new:true}); if(!doc) return res.status(404).json({message:"Not found"}); emitEvent('team:updated',{action:"update",data:doc}); res.json(doc);}catch(e){next(e)} };
exports.remove=async(req,res,next)=>{ try{ const doc=await TeamMember.findByIdAndDelete(req.params.id); if(!doc) return res.status(404).json({message:"Not found"}); emitEvent('team:updated',{action:"delete",id:req.params.id}); res.json({message:"Deleted"});}catch(e){next(e)} };
