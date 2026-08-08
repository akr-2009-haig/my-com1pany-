
const User=require('../models/User');
const bcrypt=require('bcryptjs');
exports.getAll=async(req,res,next)=>{ try{ const data=await User.find().select("-password").sort({createdAt:-1}); res.json(data);}catch(e){next(e)} };
exports.getOne=async(req,res,next)=>{ try{ const u=await User.findById(req.params.id).select("-password"); res.json(u);}catch(e){next(e)} };
exports.create=async(req,res,next)=>{ try{ const {password,...rest}=req.body; const hash=await bcrypt.hash(password,10); const u=await User.create({...rest,password:hash}); res.status(201).json({id:u._id,email:u.email,name:u.name}); }catch(e){next(e)} };
exports.update=async(req,res,next)=>{ try{ const upd={...req.body}; if(upd.password) upd.password=await bcrypt.hash(upd.password,10); const u=await User.findByIdAndUpdate(req.params.id,upd,{new:true}).select("-password"); res.json(u);}catch(e){next(e)} };
exports.remove=async(req,res,next)=>{ try{ await User.findByIdAndDelete(req.params.id); res.json({message:"Deleted"});}catch(e){next(e)} };
