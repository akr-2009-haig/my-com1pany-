const mongoose=require('mongoose');
const schemaObj={
  year:{type:String,required:true}, title:{type:String,required:true}, description:{type:String},
  isActive:{type:Boolean,default:true}, order:{type:Number,default:0}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Timeline || mongoose.model('Timeline',s);
