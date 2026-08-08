const mongoose=require('mongoose');
const schemaObj={
  name:{type:String,required:true},
  priceMonthly:{type:Number,required:true}, priceYearly:{type:Number},
  currency:{type:String,default:"USD"},
  features:[{text:String, included:{type:Boolean,default:true}}],
  isPopular:{type:Boolean,default:false}, isActive:{type:Boolean,default:true}, order:{type:Number,default:0},
  buttonLink:{type:String}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Package || mongoose.model('Package',s);
