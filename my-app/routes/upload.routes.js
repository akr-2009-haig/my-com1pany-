
const r=require('express').Router();
const upload=require('../middleware/upload');
const c=require('../controllers/upload.controller');
const {verifyToken}=require('../middleware/auth');
r.post('/single', verifyToken, upload.single('file'), c.uploadSingle);
r.post('/multiple', verifyToken, upload.array('files',10), c.uploadMultiple);
module.exports=r;
