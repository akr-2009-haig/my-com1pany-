const ActivityLog=require('../models/ActivityLog');
function activityLogger(moduleName){
  return async (req,res,next)=>{
    const origJson=res.json.bind(res);
    res.json=(body)=>{
      // log only mutating methods
      if(['POST','PUT','DELETE','PATCH'].includes(req.method) && res.statusCode<400){
        ActivityLog.create({
          user: req.user?.id, userName: req.user?.email||'system',
          action: req.method+' '+req.originalUrl, module: moduleName||'general',
          details: JSON.stringify({params:req.params, body: req.body}).slice(0,2000),
          ip: req.ip, userAgent: req.headers['user-agent']
        }).catch(()=>{});
      }
      return origJson(body);
    };
    next();
  };
}
module.exports=activityLogger;
