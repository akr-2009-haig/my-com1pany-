const r=require('express').Router();
const c=require('../controllers/auth.controller');
const {verifyToken}=require('../middleware/auth');
const {authLimiter, strictAuthLimiter}=require('../middleware/security');
const {body}=require('express-validator');
const validate=require('../middleware/validate');

r.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({min:8}),
  body('name').isLength({min:2}).trim().escape(),
  validate,
  c.register);

r.post('/login', authLimiter, strictAuthLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({min:1}),
  validate,
  c.login);

r.get('/me', verifyToken, c.me);
r.post('/logout', verifyToken, c.logout);
r.post('/change-password', verifyToken,
  body('currentPassword').isLength({min:1}),
  body('newPassword').isLength({min:8}),
  validate,
  c.changePassword);

module.exports=r;
