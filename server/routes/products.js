const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middleware/auth');

// ==========================================
// READ (조회) - 인증 불필요
// ==========================================

// 상품 전체 조회
// GET /api/products
router.get('/', productController.getProducts);

// SKU로 상품 조회 (특정 경로를 동적 파라미터보다 먼저 정의)
// GET /api/products/sku/:sku
router.get('/sku/:sku', productController.getProductBySku);

// 카테고리로 상품 조회 (특정 경로를 동적 파라미터보다 먼저 정의)
// GET /api/products/category/:category
router.get('/category/:category', productController.getProductsByCategory);

// 상품 단일 조회 (동적 파라미터는 마지막에)
// GET /api/products/:id
router.get('/:id', productController.getProduct);

// ==========================================
// CREATE (생성) - 관리자 권한 필요
// ==========================================

// 상품 생성
// POST /api/products
router.post('/', authenticate, isAdmin, productController.createProduct);

// ==========================================
// UPDATE (수정) - 관리자 권한 필요
// ==========================================

// 상품 수정
// PUT /api/products/:id
router.put('/:id', authenticate, isAdmin, productController.updateProduct);

// ==========================================
// DELETE (삭제) - 관리자 권한 필요
// ==========================================

// 상품 삭제
// DELETE /api/products/:id
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);

module.exports = router;
