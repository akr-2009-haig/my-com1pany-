const mongoose=require('mongoose');
const schemaObj={
  title:{type:String,required:true}, slug:{type:String,unique:true},
  category:{type:mongoose.Schema.Types.ObjectId, ref:"ProjectCategory"},
  client:{type:String}, description:{type:String}, challenge:{type:String}, solution:{type:String},
  images:[String], video:{type:String}, technologies:[String],
  liveUrl:{type:String}, date:{type:Date,default:Date.now},
  seoTitle:String, seoDesc:String,
  isActive:{type:Boolean,default:true}, isFeatured:{type:Boolean,default:false}, order:{type:Number,default:0}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Project || mongoose.model('Project',s);
