
const QuoteRequest=require('../models/QuoteRequest');
exports.getAll=async(req,res,next)=>{ try{ const data=await QuoteRequest.find().sort({createdAt:-1}); res.json(data);}catch(e){next(e)} };
exports.create=async(req,res,next)=>{ try{ const doc=await QuoteRequest.create(req.body); res.status(201).json(doc);}catch(e){next(e)} };
exports.update=async(req,res,next)=>{ try{ const doc=await QuoteRequest.findByIdAndUpdate(req.params.id,req.body,{new:true}); res.json(doc);}catch(e){next(e)} };
exports.remove=async(req,res,next)=>{ try{ await QuoteRequest.findByIdAndDelete(req.params.id); res.json({message:"Deleted"});}catch(e){next(e)} };
