const mongoose=require('mongoose');
const s=new mongoose.Schema({
  email:String, ip:String, userAgent:String, status:{type:String,enum:['success','failed']}, reason:String
},{timestamps:true});
module.exports=mongoose.models.LoginLog||mongoose.model('LoginLog',s);
