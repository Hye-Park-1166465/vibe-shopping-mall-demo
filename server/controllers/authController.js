const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT 토큰 생성 함수
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      user_type: user.user_type
    }, 
    process.env.JWT_SECRET || 'your-secret-key', 
    {
      expiresIn: '7d' // 7일 후 만료
    }
  );
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 필수 필드 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.'
      });
    }
    
    // 이메일로 유저 찾기
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // JWT 토큰 생성 및 발급
    const token = generateToken(user);
    
    // 비밀번호 제외하고 응답
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      message: '로그인에 성공했습니다.',
      token: token,
      data: userResponse
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 토큰으로 유저 정보 가져오기 (인증 미들웨어 사용)
exports.getMe = async (req, res) => {
  try {
    // 인증 미들웨어에서 req.user에 저장된 유저 정보 사용
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('유저 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '유저 정보 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

