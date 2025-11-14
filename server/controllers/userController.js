const User = require('../models/User');

// 유저 생성
exports.createUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;
    
    // 필수 필드 검증
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일, 이름, 비밀번호는 필수입니다.'
      });
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
    
    // 이메일 중복 확인
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }
    
    // 유저 생성 (비밀번호는 모델에서 자동 해싱됨)
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      password,
      user_type: user_type || 'customer',
      address: address || ''
    });
    
    // 비밀번호 제외하고 응답
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: '유저가 성공적으로 생성되었습니다.',
      data: userResponse
    });
  } catch (error) {
    // MongoDB 중복 키 오류 처리
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '유저 생성 실패',
      error: error.message
    });
  }
};

// 유저 전체 조회
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 조회 실패',
      error: error.message
    });
  }
};

// 유저 단일 조회
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 조회 실패',
      error: error.message
    });
  }
};

// 유저 수정
exports.updateUser = async (req, res) => {
  try {
    const { name, password, user_type, address } = req.body;
    
    // 업데이트할 필드 구성
    const updateData = {};
    if (name) updateData.name = name;
    if (password) {
      // 비밀번호 길이 검증
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: '비밀번호는 최소 6자 이상이어야 합니다.'
        });
      }
      updateData.password = password; // 모델에서 자동 해싱됨
    }
    if (user_type) {
      if (!['customer', 'admin'].includes(user_type)) {
        return res.status(400).json({
          success: false,
          message: 'user_type은 "customer" 또는 "admin"이어야 합니다.'
        });
      }
      updateData.user_type = user_type;
    }
    if (address !== undefined) updateData.address = address;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '유저 정보가 성공적으로 업데이트되었습니다.',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 업데이트 실패',
      error: error.message
    });
  }
};

// 유저 삭제
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '유저가 성공적으로 삭제되었습니다.',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '유저 삭제 실패',
      error: error.message
    });
  }
};

