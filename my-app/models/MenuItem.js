const mongoose=require('mongoose');
const schemaObj={
  title:{type:String,required:true}, url:{type:String,required:true},
  parent:{type:mongoose.Schema.Types.ObjectId, ref:"MenuItem",default:null},
  location:{type:String,enum:["header","footer"],default:"header"},
  order:{type:Number,default:0}, isActive:{type:Boolean,default:true}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.MenuItem || mongoose.model('MenuItem',s);
