const Product = require('../models/Product');

// 상품 생성
exports.createProduct = async (req, res) => {
  try {
    console.log('상품 등록 요청 받음:', req.body);
    console.log('요청한 사용자:', req.user);
    
    const { sku, name, price, category, image, description } = req.body;
    
    // 필수 필드 검증
    if (!sku || !name || price === undefined || price === null || !category || !image) {
      console.log('필수 필드 누락:', { sku: !!sku, name: !!name, price, category: !!category, image: !!image });
      return res.status(400).json({
        success: false,
        message: 'SKU, 상품명, 가격, 카테고리, 이미지는 필수입니다.'
      });
    }
    
    // 가격 검증 및 변환 (문자열도 숫자로 변환)
    let priceNumber;
    if (typeof price === 'string') {
      priceNumber = parseFloat(price);
      if (isNaN(priceNumber)) {
        return res.status(400).json({
          success: false,
          message: '가격은 유효한 숫자여야 합니다.'
        });
      }
    } else if (typeof price === 'number') {
      priceNumber = price;
    } else {
      return res.status(400).json({
        success: false,
        message: '가격은 숫자여야 합니다.'
      });
    }
    
    // 가격 범위 검증
    if (priceNumber < 0) {
      return res.status(400).json({
        success: false,
        message: '가격은 0 이상이어야 합니다.'
      });
    }
    
    // SKU 검증 (공백 제거 후 확인)
    const trimmedSku = typeof sku === 'string' ? sku.trim() : String(sku).trim();
    if (!trimmedSku) {
      return res.status(400).json({
        success: false,
        message: 'SKU는 필수입니다.'
      });
    }
    
    // 카테고리 검증
    const validCategories = ['상의', '하의', '악세사리'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: '카테고리는 상의, 하의, 악세사리 중 하나여야 합니다.'
      });
    }
    
    // 이미지 URL 검증 (기본적인 URL 형식 확인)
    const trimmedImage = typeof image === 'string' ? image.trim() : String(image).trim();
    if (!trimmedImage) {
      return res.status(400).json({
        success: false,
        message: '이미지 URL은 필수입니다.'
      });
    }
    
    // 상품 데이터 준비
    const productData = {
      sku: trimmedSku.toUpperCase(),
      name: typeof name === 'string' ? name.trim() : String(name).trim(),
      price: priceNumber,
      category: category.trim(),
      image: trimmedImage,
      description: description ? (typeof description === 'string' ? description.trim() : String(description).trim()) : ''
    };
    
    console.log('상품 생성 시도:', productData);
    
    // 상품 생성
    const product = await Product.create(productData);
    
    console.log('상품 생성 성공:', product._id);
    
    res.status(201).json({
      success: true,
      message: '상품이 성공적으로 등록되었습니다.',
      data: product
    });
  } catch (error) {
    console.error('상품 등록 오류 상세:');
    console.error('오류 이름:', error.name);
    console.error('오류 메시지:', error.message);
    console.error('오류 코드:', error.code);
    console.error('오류 스택:', error.stack);
    
    // MongoDB 중복 키 오류 처리 (SKU 중복)
    if (error.code === 11000) {
      console.log('SKU 중복 오류');
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 SKU입니다.',
        error: 'SKU는 유니크해야 합니다.'
      });
    }
    
    // MongoDB 검증 오류
    if (error.name === 'ValidationError') {
      console.log('검증 오류:', error.errors);
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '입력 데이터 검증 실패',
        errors: errors
      });
    }
    
    // MongoDB 연결 오류
    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      console.error('MongoDB 오류:', error);
      return res.status(500).json({
        success: false,
        message: '데이터베이스 연결 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : '데이터베이스 오류'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '상품 등록 실패',
      error: process.env.NODE_ENV === 'development' ? error.message : '서버 오류가 발생했습니다.',
      errorDetails: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// 상품 전체 조회 (페이지네이션 지원)
exports.getProducts = async (req, res) => {
  try {
    // 쿼리 파라미터에서 page와 limit 가져오기
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2; // 기본값 2개
    const skip = (page - 1) * limit;

    console.log(`[getProducts] 요청: page=${page}, limit=${limit}, skip=${skip}`);

    // 전체 상품 개수 조회
    const totalProducts = await Product.countDocuments();
    console.log(`[getProducts] 총 상품 개수: ${totalProducts}`);
    
    // 페이지네이션된 상품 조회
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`[getProducts] 조회된 상품 개수: ${products.length}`);

    // 총 페이지 수 계산
    const totalPages = Math.ceil(totalProducts / limit);

    const response = {
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalProducts: totalProducts,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    console.log(`[getProducts] 응답:`, {
      success: response.success,
      dataCount: response.data.length,
      totalProducts: response.pagination.totalProducts,
      totalPages: response.pagination.totalPages
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('[getProducts] 상품 조회 오류:', error);
    console.error('[getProducts] 오류 상세:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: '상품 조회 실패',
      error: error.message
    });
  }
};

// 상품 단일 조회
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회 실패',
      error: error.message
    });
  }
};

// 상품 수정
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, image, description } = req.body;
    
    // 업데이트할 필드 구성
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({
          success: false,
          message: '가격은 0 이상의 숫자여야 합니다.'
        });
      }
      updateData.price = price;
    }
    if (category) {
      const validCategories = ['상의', '하의', '악세사리'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: '카테고리는 상의, 하의, 악세사리 중 하나여야 합니다.'
        });
      }
      updateData.category = category;
    }
    if (image) updateData.image = image.trim();
    if (description !== undefined) updateData.description = description.trim();
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '상품 정보가 성공적으로 업데이트되었습니다.',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 업데이트 실패',
      error: error.message
    });
  }
};

// 상품 삭제
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 삭제되었습니다.',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 삭제 실패',
      error: error.message
    });
  }
};

// SKU로 상품 조회
exports.getProductBySku = async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.toUpperCase() });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회 실패',
      error: error.message
    });
  }
};

// 카테고리로 상품 조회
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['상의', '하의', '악세사리'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: '카테고리는 상의, 하의, 악세사리 중 하나여야 합니다.'
      });
    }
    
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회 실패',
      error: error.message
    });
  }
};
