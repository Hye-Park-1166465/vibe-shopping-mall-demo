const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  user_type: {
    type: String,
    required: true,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  address: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true
});

// 비밀번호 해싱 미들웨어 (저장 전)
userSchema.pre('save', async function(next) {
  // 비밀번호가 변경되지 않았다면 해싱하지 않음
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 업데이트 시에도 해싱
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  if (update && update.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(update.password, salt);
      
      // $set 연산자 사용 여부에 따라 처리
      if (update.$set) {
        update.$set.password = hashedPassword;
      } else {
        update.password = hashedPassword;
      }
      
      this.setUpdate(update);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);




