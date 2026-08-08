const mongoose=require('mongoose');
const schemaObj={
  name:{type:String,required:true}, company:{type:String}, email:{type:String,required:true}, phone:{type:String},
  projectType:{type:String}, budget:{type:String}, timeline:{type:String}, description:{type:String},
  attachments:[String], status:{type:String,enum:["new","review","quoted","rejected","done"],default:"new"}, notes:String
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.QuoteRequest || mongoose.model('QuoteRequest',s);
