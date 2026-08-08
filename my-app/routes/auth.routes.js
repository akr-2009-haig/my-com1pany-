
const r=require('express').Router();
const c=require('../controllers/auth.controller');
const {verifyToken}=require('../middleware/auth');
r.post('/register', c.register);
r.post('/login', c.login);
r.get('/me', verifyToken, c.me);
module.exports=r;
