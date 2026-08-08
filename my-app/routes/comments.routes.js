
const r=require('express').Router();
const c=require('../controllers/comments.controller');
const {verifyToken}=require('../middleware/auth');
r.get('/', c.getAll);
r.post('/', c.create);
r.put('/:id', verifyToken, c.update);
r.delete('/:id', verifyToken, c.remove);
module.exports=r;
