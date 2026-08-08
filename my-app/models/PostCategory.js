const mongoose=require('mongoose');
const schemaObj={
  name:{type:String,required:true,unique:true}, slug:String, description:String,
  isActive:{type:Boolean,default:true}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.PostCategory || mongoose.model('PostCategory',s);
