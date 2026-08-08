const mongoose=require('mongoose');
const schemaObj={
  title:{type:String,required:true},
  subtitle:{type:String},
  image:{type:String,required:true},
  btn1Text:{type:String}, btn1Link:{type:String},
  btn2Text:{type:String}, btn2Link:{type:String}, showBtn2:{type:Boolean,default:true},
  order:{type:Number,default:0},
  isActive:{type:Boolean,default:true}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Slide || mongoose.model('Slide',s);
