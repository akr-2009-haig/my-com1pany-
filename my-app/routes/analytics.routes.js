
const r=require('express').Router();
const c=require('../controllers/analytics.controller');
const {verifyToken}=require('../middleware/auth');
r.get('/overview', verifyToken, c.overview);
module.exports=r;
