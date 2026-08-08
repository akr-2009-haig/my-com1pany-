
const r=require('express').Router();
const c=require('../controllers/users.controller');
const {verifyToken}=require('../middleware/auth');
r.get('/', verifyToken, c.getAll);
r.get('/:id', verifyToken, c.getOne);
r.post('/', verifyToken, c.create);
r.put('/:id', verifyToken, c.update);
r.delete('/:id', verifyToken, c.remove);
module.exports=r;
