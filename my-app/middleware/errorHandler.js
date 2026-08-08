function errorHandler(err,req,res,next){
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err.message);
  if(err.code==='LIMIT_FILE_SIZE') return res.status(400).json({message:'File too large, max 5MB'});
  const status=err.status||500;
  const msg = process.env.NODE_ENV==='production' && status===500 ? 'Internal Server Error' : err.message;
  res.status(status).json({ message: msg });
}
module.exports=errorHandler;
