const mongoose=require('mongoose');
const schemaObj={
  name:{type:String,required:true},
  email:{type:String,required:true,unique:true,lowercase:true},
  username:{type:String,unique:true,sparse:true},
  password:{type:String,required:true},
  role:{type:String,enum:["admin","editor","viewer"],default:"admin"},
  avatar:{type:String},
  isActive:{type:Boolean,default:true},
  lastLogin:{type:Date}
};
const s=new mongoose.Schema(schemaObj,{timestamps:true});
module.exports=mongoose.models.User || mongoose.model('User',s);
