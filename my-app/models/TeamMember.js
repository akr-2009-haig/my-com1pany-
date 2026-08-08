const mongoose=require('mongoose');
const schemaObj={
  name:{type:String,required:true}, role:{type:String}, bio:{type:String},
  avatar:{type:String},
  socials:{ linkedin:String, twitter:String, email:String },
  isActive:{type:Boolean,default:true}, order:{type:Number,default:0}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.TeamMember || mongoose.model('TeamMember',s);
