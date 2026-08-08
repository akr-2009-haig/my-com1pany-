const mongoose=require('mongoose');
const schemaObj={
  title:{type:String,required:true}, titleEn:{type:String},
  slug:{type:String,unique:true},
  shortDesc:{type:String}, description:{type:String},
  image:{type:String}, icon:{type:String},
  features:[{text:String}], technologies:[{name:String,logo:String}],
  bannerImage:{type:String},
  seoTitle:{type:String}, seoDesc:{type:String}, keywords:{type:String},
  isActive:{type:Boolean,default:true}, isFeatured:{type:Boolean,default:false},
  order:{type:Number,default:0}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Service || mongoose.model('Service',s);
