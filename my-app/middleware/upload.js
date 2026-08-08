
const multer=require('multer');
const { CloudinaryStorage }=require('multer-storage-cloudinary');
const cloudinary=require('../lib/cloudinary');
const storage=new CloudinaryStorage({
  cloudinary, params:{ folder:"mycompany", allowed_formats:["jpg","png","jpeg","webp","pdf"], transformation:[{quality:"auto"}] }
});
const upload=multer({ storage, limits:{fileSize:10*1024*1024} });
module.exports=upload;
