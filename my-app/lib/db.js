
const mongoose=require('mongoose');
let cached=false;
async function connectDB(){
  if(cached && mongoose.connection.readyState===1) return mongoose.connection;
  const uri=process.env.MONGODB_URI||"mongodb://localhost:27017/mycompany";
  if(!uri) throw new Error("MONGODB_URI missing");
  if(mongoose.connection.readyState===1) {cached=true; return mongoose.connection;}
  await mongoose.connect(uri,{autoIndex:true, serverSelectionTimeoutMS:5000, socketTimeoutMS:10000});
  cached=true;
  console.log("MongoDB connected");
  return mongoose.connection;
}
module.exports=connectDB;
