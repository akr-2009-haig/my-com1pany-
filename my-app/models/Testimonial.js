const mongoose=require('mongoose');
const schemaObj={
  name:{type:String,required:true}, role:{type:String}, company:{type:String},
  avatar:{type:String}, content:{type:String,required:true}, rating:{type:Number,min:1,max:5,default:5},
  isActive:{type:Boolean,default:true}, order:{type:Number,default:0}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Testimonial || mongoose.model('Testimonial',s);
