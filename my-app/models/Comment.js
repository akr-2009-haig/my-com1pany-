const mongoose=require('mongoose');
const schemaObj={
  post:{type:mongoose.Schema.Types.ObjectId, ref:"Post",required:true},
  name:{type:String,required:true}, email:{type:String,required:true}, content:{type:String,required:true},
  status:{type:String,enum:["pending","approved","rejected"],default:"pending"}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Comment || mongoose.model('Comment',s);
