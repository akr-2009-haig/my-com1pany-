
const JobApplication=require('../models/JobApplication');
exports.getAll=async(req,res,next)=>{ try{ const data=await JobApplication.find().populate('job','title').sort({createdAt:-1}); res.json(data);}catch(e){next(e)} };
exports.create=async(req,res,next)=>{ try{ const doc=await JobApplication.create(req.body); res.status(201).json(doc);}catch(e){next(e)} };
exports.update=async(req,res,next)=>{ try{ const doc=await JobApplication.findByIdAndUpdate(req.params.id,req.body,{new:true}); res.json(doc);}catch(e){next(e)} };
exports.remove=async(req,res,next)=>{ try{ await JobApplication.findByIdAndDelete(req.params.id); res.json({message:"Deleted"});}catch(e){next(e)} };
