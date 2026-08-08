const mongoose=require('mongoose');
const s=new mongoose.Schema({
  ip:{type:String,required:true,unique:true}, reason:String, expiresAt:Date, createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'User'}
},{timestamps:true});
s.index({expiresAt:1},{expireAfterSeconds:0});
module.exports=mongoose.models.BlockedIp||mongoose.model('BlockedIp',s);
