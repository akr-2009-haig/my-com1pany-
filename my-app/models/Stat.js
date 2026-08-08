const mongoose=require('mongoose');
const schemaObj={
  value:{type:Number,required:true}, label:{type:String,required:true}, icon:{type:String}, suffix:{type:String,default:"+"},
  isActive:{type:Boolean,default:true}, order:{type:Number,default:0}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Stat || mongoose.model('Stat',s);
