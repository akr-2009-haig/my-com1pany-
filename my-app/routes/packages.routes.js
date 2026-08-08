const express=require('express'); const router=express.Router();
const ctrl=require('../controllers/packages.controller');
const {verifyToken}=require('../middleware/auth');
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', verifyToken, ctrl.create);
router.put('/:id', verifyToken, ctrl.update);
router.delete('/:id', verifyToken, ctrl.remove);
module.exports=router;
