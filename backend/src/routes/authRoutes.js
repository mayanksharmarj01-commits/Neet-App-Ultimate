const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google-signin', authController.googleSignIn);
router.get('/me', authMiddleware, authController.getMe);
router.patch('/updateMe', authMiddleware, authController.updateMe);
router.patch('/updatePassword', authMiddleware, authController.updatePassword);
router.patch('/setupProfile', authMiddleware, authController.setupProfile);

module.exports = router;
