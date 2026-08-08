
const User=require('../models/User');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
function sign(user){ return jwt.sign({id:user._id,role:user.role,email:user.email}, process.env.JWT_SECRET||"secret", {expiresIn: process.env.JWT_EXPIRES_IN||"7d"}); }
exports.register=async(req,res,next)=>{
  try{
    const {name,email,password,role}=req.body;
    if(!email||!password||!name) return res.status(400).json({message:"Missing fields"});
    const exists=await User.findOne({email});
    if(exists) return res.status(400).json({message:"Email exists"});
    const hash=await bcrypt.hash(password,10);
    const user=await User.create({name,email,password:hash,role:role||"admin"});
    const token=sign(user);
    res.status(201).json({token,user:{id:user._id,name:user.name,email:user.email,role:user.role}});
  }catch(e){next(e)}
};
exports.login=async(req,res,next)=>{
  try{
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(!user) return res.status(401).json({message:"Invalid credentials"});
    const ok=await bcrypt.compare(password,user.password);
    if(!ok) return res.status(401).json({message:"Invalid credentials"});
    user.lastLogin=new Date(); await user.save();
    const token=sign(user);
    res.json({token,user:{id:user._id,name:user.name,email:user.email,role:user.role}});
  }catch(e){next(e)}
};
exports.me=async(req,res,next)=>{
  try{
    const user=await User.findById(req.user.id).select("-password");
    res.json(user);
  }catch(e){next(e)}
};
