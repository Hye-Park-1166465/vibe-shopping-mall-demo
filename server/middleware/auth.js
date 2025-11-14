const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 토큰 검증 미들웨어
exports.authenticate = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('인증 토큰 없음:', req.url);
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }
    
    // Bearer 제거하고 토큰만 추출
    const token = authHeader.substring(7);
    
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('토큰 검증 성공, userId:', decoded.userId);
    
    // 토큰에서 유저 ID 추출하여 유저 정보 가져오기
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('유저를 찾을 수 없음:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }
    
    console.log('인증 성공, 사용자:', user.email, '권한:', user.user_type);
    
    // req.user에 유저 정보 저장 (다음 미들웨어에서 사용 가능)
    req.user = user;
    next();
  } catch (error) {
    console.error('인증 미들웨어 오류:', error.name, error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : '인증 오류'
    });
  }
};

// 관리자 권한 체크 미들웨어
exports.isAdmin = (req, res, next) => {
  // authenticate 미들웨어를 먼저 실행해야 함 (req.user가 있어야 함)
  if (!req.user) {
    console.log('관리자 권한 체크 실패: req.user가 없음');
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.'
    });
  }
  
  // 관리자 권한 확인
  const isAdminUser = req.user.user_type === 'admin' || req.user.role === 'admin';
  
  console.log('관리자 권한 체크:', {
    user: req.user.email,
    user_type: req.user.user_type,
    role: req.user.role,
    isAdmin: isAdminUser
  });
  
  if (!isAdminUser) {
    console.log('관리자 권한 없음:', req.user.email);
    return res.status(403).json({
      success: false,
      message: '관리자 권한이 필요합니다.'
    });
  }
  
  console.log('관리자 권한 확인 완료:', req.user.email);
  next();
};

