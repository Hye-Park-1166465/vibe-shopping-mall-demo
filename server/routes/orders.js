const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/auth');

// ==========================================
// CREATE (생성) - 인증 필요
// ==========================================

// 주문 생성 (장바구니에서 주문 생성)
// POST /api/orders
router.post('/', authenticate, orderController.createOrder);

// ==========================================
// READ (조회) - 인증 필요
// ==========================================

// 내 주문 목록 조회
// GET /api/orders/my
router.get('/my', authenticate, orderController.getMyOrders);

// 전체 주문 목록 조회 (관리자용)
// GET /api/orders
router.get('/', authenticate, isAdmin, orderController.getAllOrders);

// 특정 주문 조회 (본인 주문 또는 관리자)
// GET /api/orders/:id
router.get('/:id', authenticate, orderController.getOrder);

// ==========================================
// UPDATE (수정) - 관리자 권한 필요
// ==========================================

// 주문 상태 수정 (관리자용)
// PUT /api/orders/:id/status
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);

// 결제 상태 수정
// PUT /api/orders/:id/payment
router.put('/:id/payment', authenticate, isAdmin, orderController.updatePaymentStatus);

// ==========================================
// DELETE (삭제) - 관리자 권한 필요
// ==========================================

// 주문 삭제 (관리자용)
// DELETE /api/orders/:id
router.delete('/:id', authenticate, isAdmin, orderController.deleteOrder);

module.exports = router;

