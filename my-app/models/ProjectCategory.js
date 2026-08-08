const mongoose=require('mongoose');
const schemaObj={
  name:{type:String,required:true,unique:true}, slug:String, description:String, icon:String,
  isActive:{type:Boolean,default:true}, order:{type:Number,default:0}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.ProjectCategory || mongoose.model('ProjectCategory',s);
