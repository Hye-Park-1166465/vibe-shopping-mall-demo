const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

// ==========================================
// 모든 장바구니 작업은 인증 필요
// ==========================================

// 장바구니 조회 (없으면 생성)
// GET /api/carts
router.get('/', authenticate, cartController.getCart);

// 장바구니에 아이템 추가
// POST /api/carts/items
router.post('/items', authenticate, cartController.addItem);

// 장바구니 아이템 수량 수정
// PUT /api/carts/items/:itemId
router.put('/items/:itemId', authenticate, cartController.updateItem);

// 장바구니 아이템 삭제
// DELETE /api/carts/items/:itemId
router.delete('/items/:itemId', authenticate, cartController.removeItem);

// 장바구니 비우기
// DELETE /api/carts
router.delete('/', authenticate, cartController.clearCart);

module.exports = router;

