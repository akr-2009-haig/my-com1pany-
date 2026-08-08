const mongoose=require('mongoose');
const schemaObj={
  question:{type:String,required:true}, answer:{type:String,required:true},
  category:{type:mongoose.Schema.Types.ObjectId, ref:"FaqCategory"},
  isActive:{type:Boolean,default:true}, order:{type:Number,default:0}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Faq || mongoose.model('Faq',s);
