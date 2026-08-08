const r=require('express').Router();
const c=require('../controllers/backup.controller');
const {verifyToken, authorize}=require('../middleware/auth');
r.use(verifyToken, authorize('admin'));
r.post('/create', c.createBackup);
r.get('/list', c.listBackups);
r.post('/restore', c.restoreBackup);
r.delete('/:file', c.deleteBackup);
module.exports=r;
