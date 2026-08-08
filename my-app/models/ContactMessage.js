const mongoose=require('mongoose');
const schemaObj={
  name:{type:String,required:true}, email:{type:String,required:true}, phone:{type:String},
  service:{type:String}, message:{type:String,required:true},
  isRead:{type:Boolean,default:false}, notes:{type:String}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.ContactMessage || mongoose.model('ContactMessage',s);
