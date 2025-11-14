const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// 로그인
router.post('/login', authController.login);

// 토큰으로 유저 정보 가져오기 (인증 필요)
router.get('/me', authenticate, authController.getMe);

module.exports = router;

