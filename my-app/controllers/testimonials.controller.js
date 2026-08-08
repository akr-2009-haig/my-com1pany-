const Testimonial=require('../models/Testimonial');
const emitEvent=require('../events/emitEvent');
exports.getAll=async(req,res,next)=>{ try{ const data=await Testimonial.find().sort({order:1,createdAt:-1}); res.json(data);}catch(e){next(e)} };
exports.getOne=async(req,res,next)=>{ try{ const doc=await Testimonial.findById(req.params.id); if(!doc) return res.status(404).json({message:"Not found"}); res.json(doc);}catch(e){next(e)} };
exports.create=async(req,res,next)=>{ try{ const doc=await Testimonial.create(req.body); emitEvent('testimonials:updated',{action:"create",data:doc}); res.status(201).json(doc);}catch(e){next(e)} };
exports.update=async(req,res,next)=>{ try{ const doc=await Testimonial.findByIdAndUpdate(req.params.id, req.body, {new:true}); if(!doc) return res.status(404).json({message:"Not found"}); emitEvent('testimonials:updated',{action:"update",data:doc}); res.json(doc);}catch(e){next(e)} };
exports.remove=async(req,res,next)=>{ try{ const doc=await Testimonial.findByIdAndDelete(req.params.id); if(!doc) return res.status(404).json({message:"Not found"}); emitEvent('testimonials:updated',{action:"delete",id:req.params.id}); res.json({message:"Deleted"});}catch(e){next(e)} };
