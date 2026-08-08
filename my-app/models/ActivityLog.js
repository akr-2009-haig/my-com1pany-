const mongoose=require('mongoose');
const s=new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
  userName:String, action:String, module:String, details:String, ip:String, userAgent:String
},{timestamps:true});
module.exports=mongoose.models.ActivityLog||mongoose.model('ActivityLog',s);
