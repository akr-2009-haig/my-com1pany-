const mongoose=require('mongoose');
const schemaObj={
  key:{type:String,required:true,unique:true}, title:{type:String},
  isVisible:{type:Boolean,default:true}, order:{type:Number,default:0}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.PageSection || mongoose.model('PageSection',s);
