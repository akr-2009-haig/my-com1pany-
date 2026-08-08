const mongoose=require('mongoose');
const schemaObj={
  page:{type:String,required:true,unique:true}, title:{type:String}, image:{type:String}, isActive:{type:Boolean,default:true}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.PageBanner || mongoose.model('PageBanner',s);
