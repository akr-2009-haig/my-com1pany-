const User=require('../models/User');
const LoginLog=require('../models/LoginLog');
const BlockedIp=require('../models/BlockedIp');
const ActivityLog=require('../models/ActivityLog');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');

function sign(user){
  return jwt.sign({id:user._id, role:user.role, email:user.email}, process.env.JWT_SECRET||'secret', {expiresIn: process.env.JWT_EXPIRES_IN||'7d'});
}
function strongPassword(p){
  // at least 8 chars, 1 upper, 1 lower, 1 number
  return p.length>=8 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p);
}

exports.register=async(req,res,next)=>{
  try{
    const {name,email,password,role}=req.body;
    if(!name||!email||!password) return res.status(400).json({message:'Missing fields'});
    if(!strongPassword(password)) return res.status(400).json({message:'Password too weak: min 8 chars, upper, lower, number'});
    const exists=await User.findOne({email: email.toLowerCase()});
    if(exists) return res.status(400).json({message:'Email already exists'});
    const hash=await bcrypt.hash(password,12);
    // only first user can be admin, others default editor unless requester is admin
    let finalRole='editor';
    const count=await User.countDocuments();
    if(count===0) finalRole='admin';
    else if(req.user && req.user.role==='admin' && ['admin','editor','viewer'].includes(role)) finalRole=role;
    const user=await User.create({name,email:email.toLowerCase(), password:hash, role:finalRole});
    const token=sign(user);
    // set httpOnly cookie
    res.cookie('token', token, {httpOnly:true, secure: process.env.NODE_ENV==='production', sameSite:'lax', maxAge:7*24*60*60*1000});
    await ActivityLog.create({user:user._id, userName:user.email, action:'REGISTER', module:'auth', details:'New user '+email, ip:req.ip, userAgent:req.headers['user-agent']}).catch(()=>{});
    res.status(201).json({token, user:{id:user._id,name:user.name,email:user.email,role:user.role}});
  }catch(e){ next(e) }
};

exports.login=async(req,res,next)=>{
  const ip=req.ip;
  const ua=req.headers['user-agent'];
  try{
    const {email,password}=req.body;
    if(!email||!password) return res.status(400).json({message:'Email and password required'});
    const user=await User.findOne({email: email.toLowerCase()});
    if(!user){
      await LoginLog.create({email, ip, userAgent:ua, status:'failed', reason:'user not found'}).catch(()=>{});
      return res.status(401).json({message:'Invalid credentials'});
    }
    if(user.isActive===false) return res.status(403).json({message:'Account disabled'});
    // check if IP has too many fails
    const fails=await LoginLog.countDocuments({ip, status:'failed', createdAt:{ $gte: new Date(Date.now()-15*60*1000)}});
    if(fails>=5){
      const expires=new Date(Date.now()+ (parseInt(process.env.BLOCK_DURATION||'30')*60*1000));
      await BlockedIp.findOneAndUpdate({ip},{ip, reason:'Too many failed logins', expiresAt:expires}, {upsert:true}).catch(()=>{});
      return res.status(429).json({message:'Too many failed attempts. IP blocked for 30 minutes.'});
    }
    const ok=await bcrypt.compare(password, user.password);
    if(!ok){
      await LoginLog.create({email, ip, userAgent:ua, status:'failed', reason:'wrong password'}).catch(()=>{});
      return res.status(401).json({message:'Invalid credentials'});
    }
    user.lastLogin=new Date();
    await user.save();
    await LoginLog.create({email, ip, userAgent:ua, status:'success'}).catch(()=>{});
    const token=sign(user);
    res.cookie('token', token, {httpOnly:true, secure: process.env.NODE_ENV==='production', sameSite:'lax', maxAge:7*24*60*60*1000});
    await ActivityLog.create({user:user._id, userName:user.email, action:'LOGIN', module:'auth', ip:req.ip, userAgent:ua}).catch(()=>{});
    res.json({token, user:{id:user._id,name:user.name,email:user.email,role:user.role}});
  }catch(e){ next(e) }
};

exports.me=async(req,res,next)=>{
  try{
    const user=await User.findById(req.user.id).select('-password');
    if(!user) return res.status(404).json({message:'User not found'});
    res.json(user);
  }catch(e){ next(e) }
};

exports.logout=async(req,res)=>{
  res.clearCookie('token');
  res.json({message:'Logged out'});
};

exports.changePassword=async(req,res,next)=>{
  try{
    const {currentPassword, newPassword}=req.body;
    const user=await User.findById(req.user.id);
    const ok=await bcrypt.compare(currentPassword, user.password);
    if(!ok) return res.status(400).json({message:'Current password incorrect'});
    if(!strongPassword(newPassword)) return res.status(400).json({message:'New password too weak'});
    user.password=await bcrypt.hash(newPassword,12);
    await user.save();
    await ActivityLog.create({user:user._id, userName:user.email, action:'CHANGE_PASSWORD', module:'auth', ip:req.ip}).catch(()=>{});
    res.json({message:'Password changed'});
  }catch(e){ next(e) }
};
