const mongoose=require('mongoose');
const schemaObj={
  job:{type:mongoose.Schema.Types.ObjectId, ref:"Job"},
  name:{type:String,required:true}, email:{type:String,required:true}, phone:{type:String},
  coverLetter:{type:String}, cv:{type:String},
  status:{type:String,enum:["new","review","interview","accepted","rejected"],default:"new"}, notes:String
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.JobApplication || mongoose.model('JobApplication',s);
