const mongoose=require('mongoose');
const schemaObj={
  title:{type:String,required:true}, slug:{type:String,unique:true},
  department:{type:String}, type:{type:String,enum:["full-time","part-time","remote","contract"],default:"full-time"},
  location:{type:String}, description:String, requirements:String, skills:String, benefits:String,
  deadline:{type:Date}, isActive:{type:Boolean,default:true}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Job || mongoose.model('Job',s);
