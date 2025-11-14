const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 장바구니 조회 (없으면 생성)
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('[getCart] 사용자 ID:', userId);

    // 장바구니 조회 또는 생성
    let cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price image sku category');

    if (!cart) {
      // 장바구니가 없으면 새로 생성
      cart = await Cart.create({ user: userId, items: [] });
      console.log('[getCart] 새 장바구니 생성:', cart._id);
    }

    console.log('[getCart] 장바구니 아이템 수:', cart.items.length);

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('[getCart] 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니 조회 실패',
      error: error.message
    });
  }
};

// 장바구니에 아이템 추가
exports.addItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1, size } = req.body;

    console.log('[addItem] 요청:', { userId, productId, quantity, size });

    // 필수 필드 검증
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '상품 ID는 필수입니다.'
      });
    }

    // 수량 검증
    const quantityNumber = parseInt(quantity);
    if (isNaN(quantityNumber) || quantityNumber < 1) {
      return res.status(400).json({
        success: false,
        message: '수량은 1 이상의 숫자여야 합니다.'
      });
    }

    // 상품 존재 여부 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    // 사이즈 검증 (제공된 경우)
    if (size) {
      const validSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
      if (!validSizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 사이즈입니다.'
        });
      }
    }

    // 장바구니 조회 또는 생성
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
      console.log('[addItem] 새 장바구니 생성:', cart._id);
    }

    // 같은 상품과 사이즈가 이미 장바구니에 있는지 확인
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size
    );

    if (existingItemIndex !== -1) {
      // 이미 존재하면 수량만 증가
      cart.items[existingItemIndex].quantity += quantityNumber;
      console.log('[addItem] 기존 아이템 수량 증가:', cart.items[existingItemIndex].quantity);
    } else {
      // 새 아이템 추가
      cart.items.push({
        product: productId,
        quantity: quantityNumber,
        size: size || undefined,
        price: product.price,
        name: product.name,
        image: product.image
      });
      console.log('[addItem] 새 아이템 추가');
    }

    await cart.save();
    await cart.populate('items.product', 'name price image sku category');

    res.status(200).json({
      success: true,
      message: '장바구니에 상품이 추가되었습니다.',
      data: cart
    });
  } catch (error) {
    console.error('[addItem] 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니에 상품 추가 실패',
      error: error.message
    });
  }
};

// 장바구니 아이템 수량 수정
exports.updateItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    console.log('[updateItem] 요청:', { userId, itemId, quantity });

    // 수량 검증
    const quantityNumber = parseInt(quantity);
    if (isNaN(quantityNumber) || quantityNumber < 1) {
      return res.status(400).json({
        success: false,
        message: '수량은 1 이상의 숫자여야 합니다.'
      });
    }

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    // 아이템 찾기
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '장바구니에 해당 아이템을 찾을 수 없습니다.'
      });
    }

    // 수량 업데이트
    cart.items[itemIndex].quantity = quantityNumber;
    await cart.save();
    await cart.populate('items.product', 'name price image sku category');

    console.log('[updateItem] 아이템 수량 업데이트 완료');

    res.status(200).json({
      success: true,
      message: '장바구니 아이템 수량이 업데이트되었습니다.',
      data: cart
    });
  } catch (error) {
    console.error('[updateItem] 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니 아이템 수량 업데이트 실패',
      error: error.message
    });
  }
};

// 장바구니 아이템 삭제
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    console.log('[removeItem] 요청:', { userId, itemId });

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    // 아이템 찾기
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '장바구니에 해당 아이템을 찾을 수 없습니다.'
      });
    }

    // 아이템 삭제
    cart.items.splice(itemIndex, 1);
    await cart.save();
    await cart.populate('items.product', 'name price image sku category');

    console.log('[removeItem] 아이템 삭제 완료');

    res.status(200).json({
      success: true,
      message: '장바구니에서 아이템이 삭제되었습니다.',
      data: cart
    });
  } catch (error) {
    console.error('[removeItem] 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니 아이템 삭제 실패',
      error: error.message
    });
  }
};

// 장바구니 비우기
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('[clearCart] 요청:', userId);

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    // 장바구니 비우기
    cart.items = [];
    await cart.save();

    console.log('[clearCart] 장바구니 비우기 완료');

    res.status(200).json({
      success: true,
      message: '장바구니가 비워졌습니다.',
      data: cart
    });
  } catch (error) {
    console.error('[clearCart] 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니 비우기 실패',
      error: error.message
    });
  }
};

