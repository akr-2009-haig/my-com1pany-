
const jwt=require('jsonwebtoken');
function verifyToken(req,res,next){
  const header=req.headers.authorization||req.headers.Authorization;
  const token= header && header.startsWith('Bearer ') ? header.split(' ')[1] : (req.cookies && req.cookies.token);
  if(!token) return res.status(401).json({message:"Unauthorized"});
  try{
    const decoded=jwt.verify(token, process.env.JWT_SECRET||"secret");
    req.user=decoded;
    next();
  }catch(e){ return res.status(401).json({message:"Invalid token"}); }
}
function authorize(...roles){
  return (req,res,next)=>{
    if(roles.length && !roles.includes(req.user.role)) return res.status(403).json({message:"Forbidden"});
    next();
  }
}
module.exports={verifyToken,authorize};
