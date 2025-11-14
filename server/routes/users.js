const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 유저 생성
router.post('/', userController.createUser);

// 유저 전체 조회
router.get('/', userController.getUsers);

// 유저 단일 조회
router.get('/:id', userController.getUser);

// 유저 수정
router.put('/:id', userController.updateUser);

// 유저 삭제
router.delete('/:id', userController.deleteUser);

module.exports = router;

