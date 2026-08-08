const mongoose=require('mongoose');
const schemaObj={
  name:{type:String,required:true}, logo:{type:String,required:true}, url:{type:String},
  isActive:{type:Boolean,default:true}, order:{type:Number,default:0}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Partner || mongoose.model('Partner',s);
