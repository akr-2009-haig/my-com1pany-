
const Comment=require('../models/Comment');
const emit=require('../events/emitEvent');
exports.getAll=async(req,res,next)=>{ try{ const q={}; if(req.query.post) q.post=req.query.post; if(req.query.status) q.status=req.query.status; const data=await Comment.find(q).populate('post','title slug').sort({createdAt:-1}); res.json(data);}catch(e){next(e)} };
exports.create=async(req,res,next)=>{ try{ const doc=await Comment.create(req.body); emit('comments:updated',{action:"create",data:doc}); res.status(201).json(doc);}catch(e){next(e)} };
exports.update=async(req,res,next)=>{ try{ const doc=await Comment.findByIdAndUpdate(req.params.id,req.body,{new:true}); emit('comments:updated',{action:"update",data:doc}); res.json(doc);}catch(e){next(e)} };
exports.remove=async(req,res,next)=>{ try{ await Comment.findByIdAndDelete(req.params.id); emit('comments:updated',{action:"delete",id:req.params.id}); res.json({message:"Deleted"});}catch(e){next(e)} };
