const multer=require('multer');
const { CloudinaryStorage }=require('multer-storage-cloudinary');
const cloudinary=require('../lib/cloudinary');
const path=require('path');
const allowed = ['image/jpeg','image/png','image/webp','application/pdf'];
function fileFilter(req,file,cb){
  if(allowed.includes(file.mimetype)) cb(null,true);
  else cb(new Error('Invalid file type. Allowed: jpg, png, webp, pdf'), false);
}
const storage=new CloudinaryStorage({
  cloudinary, params: async (req,file)=>({
    folder:"mycompany",
    allowed_formats:["jpg","png","jpeg","webp","pdf"],
    resource_type: file.mimetype==='application/pdf' ? 'raw' : 'image',
    transformation:[{quality:"auto"}],
    public_id: Date.now() + '-' + path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g,'_')
  })
});
const upload=multer({ storage, fileFilter, limits:{fileSize:5*1024*1024, files:10} });
module.exports=upload;
