const mongoose=require('mongoose');
const schemaObj={
  title:{type:String,required:true}, slug:{type:String,unique:true},
  content:{type:String}, excerpt:{type:String},
  image:{type:String},
  category:{type:mongoose.Schema.Types.ObjectId, ref:"PostCategory"},
  tags:[String],
  author:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
  views:{type:Number,default:0},
  status:{type:String,enum:["published","draft","scheduled"],default:"published"},
  publishedAt:{type:Date,default:Date.now},
  seoTitle:String, seoDesc:String
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.Post || mongoose.model('Post',s);
