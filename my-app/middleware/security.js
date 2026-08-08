const rateLimit=require('express-rate-limit');
const mongoSanitize=require('express-mongo-sanitize');
const hpp=require('hpp');
const xss=require('xss-clean');

// Global API limiter
const apiLimiter=rateLimit({
  windowMs:15*60*1000, max:300, message:{message:'Too many requests, try again later'},
  standardHeaders:true, legacyHeaders:false
});
const authLimiter=rateLimit({
  windowMs:15*60*1000, max:20, message:{message:'Too many login attempts, try later'},
  standardHeaders:true
});
const strictAuthLimiter=rateLimit({
  windowMs:15*60*1000, max:5, message:{message:'Too many failed attempts, IP temporarily blocked'},
  skipSuccessfulRequests:true
});

function securityMiddlewares(app){
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp({whitelist:['price','tags']}));
}

module.exports={apiLimiter, authLimiter, strictAuthLimiter, securityMiddlewares};
