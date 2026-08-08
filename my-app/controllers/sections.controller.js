
const PageSection=require('../models/PageSection');
const emit=require('../events/emitEvent');
exports.getAll=async(req,res,next)=>{ try{ const data=await PageSection.find().sort({order:1}); if(data.length===0){ const defaults=["hero","stats","about","services","whyus","portfolio","testimonials","pricing","partners","blog","cta","contact"].map((k,i)=>({key:k,title:k,order:i,isVisible:true})); await PageSection.insertMany(defaults); return res.json(await PageSection.find().sort({order:1})); } res.json(data);}catch(e){next(e)} };
exports.update=async(req,res,next)=>{ try{ const doc=await PageSection.findByIdAndUpdate(req.params.id,req.body,{new:true}); emit('sections:updated',{action:"update",data:doc}); res.json(doc);}catch(e){next(e)} };
exports.create=async(req,res,next)=>{ try{ const doc=await PageSection.create(req.body); emit('sections:updated',{action:"create",data:doc}); res.json(doc);}catch(e){next(e)} };
exports.remove=async(req,res,next)=>{ try{ await PageSection.findByIdAndDelete(req.params.id); res.json({message:"Deleted"});}catch(e){next(e)} };
exports.getOne=async(req,res,next)=>{ try{ const d=await PageSection.findById(req.params.id); res.json(d);}catch(e){next(e)} };
exports.reorder=async(req,res,next)=>{ try{ const {orderedIds}=req.body; for(let i=0;i<orderedIds.length;i++){ await PageSection.findByIdAndUpdate(orderedIds[i],{order:i}); } emit('sections:updated',{action:"reorder"}); res.json({message:"Reordered"});}catch(e){next(e)} };
