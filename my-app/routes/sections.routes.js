
const r=require('express').Router();
const c=require('../controllers/sections.controller');
const {verifyToken}=require('../middleware/auth');
r.get('/', c.getAll);
r.post('/reorder', verifyToken, c.reorder);
r.get('/:id', c.getOne);
r.post('/', verifyToken, c.create);
r.put('/:id', verifyToken, c.update);
r.delete('/:id', verifyToken, c.remove);
module.exports=r;
