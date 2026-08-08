const mongoose=require('mongoose');
const schemaObj={
  siteName:{type:String,default:"My Company"}, siteNameEn:String,
  logo:String, logoLight:String, favicon:String, description:String,
  phone:String, phone2:String, whatsapp:String, email:String, email2:String,
  address:String, workingHours:String, mapEmbed:String,
  socials:{ facebook:String, twitter:String, instagram:String, linkedin:String, youtube:String, tiktok:String },
  seo:{ title:String, description:String, keywords:String, ogImage:String, ga:String, gtm:String, pixel:String, robots:String },
  smtp:{ host:String, port:Number, user:String, pass:String, encryption:String, fromName:String, fromEmail:String },
  whatsappSettings:{ enabled:{type:Boolean,default:true}, number:String, welcomeMessage:String, tooltip:String, position:{type:String,default:"left"} },
  maintenance:{ enabled:{type:Boolean,default:false}, title:String, message:String, image:String, returnDate:Date },
  languages:{ bilingual:{type:Boolean,default:false}, defaultLang:{type:String,default:"ar"} },
  security:{ recaptchaEnabled:Boolean, siteKey:String, secretKey:String, maxAttempts:Number, blockDuration:Number, twoFactor:Boolean },
  notifications:{ onMessage:Boolean, onQuote:Boolean, onApplication:Boolean, onComment:Boolean, email:String }
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Settings || mongoose.model('Settings',s);
