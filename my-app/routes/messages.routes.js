
const r=require('express').Router();
const c=require('../controllers/messages.controller');
const {verifyToken}=require('../middleware/auth');
r.get('/', verifyToken, c.getAll);
r.get('/:id', verifyToken, c.getOne);
r.post('/', c.create);
r.put('/:id', verifyToken, c.update);
r.delete('/:id', verifyToken, c.remove);
module.exports=r;
