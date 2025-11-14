// 입력 검증 미들웨어

/**
 * 이메일 형식 검증
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 유저 생성 검증
 */
exports.validateCreateUser = (req, res, next) => {
  const { email, name, password } = req.body;
  
  // 필수 필드 검증
  if (!email || !name || !password) {
    return res.status(400).json({
      success: false,
      message: '이메일, 이름, 비밀번호는 필수입니다.'
    });
  }
  
  // 이메일 형식 검증
  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: '올바른 이메일 형식이 아닙니다.'
    });
  }
  
  // 비밀번호 길이 검증
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: '비밀번호는 최소 6자 이상이어야 합니다.'
    });
  }
  
  next();
};

/**
 * 유저 업데이트 검증
 */
exports.validateUpdateUser = (req, res, next) => {
  const { password, user_type } = req.body;
  
  // 비밀번호 길이 검증
  if (password && password.length < 6) {
    return res.status(400).json({
      success: false,
      message: '비밀번호는 최소 6자 이상이어야 합니다.'
    });
  }
  
  // user_type 검증
  if (user_type && !['customer', 'admin'].includes(user_type)) {
    return res.status(400).json({
      success: false,
      message: 'user_type은 "customer" 또는 "admin"이어야 합니다.'
    });
  }
  
  next();
};

