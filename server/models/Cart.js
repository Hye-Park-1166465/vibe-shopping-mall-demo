const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    type: String,
    enum: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    required: false,
    trim: true
  },
  // 주문 시점의 가격 스냅샷 (상품 가격이 변경되어도 장바구니 가격은 유지)
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // 상품명 스냅샷
  name: {
    type: String,
    required: true,
    trim: true
  },
  // 상품 이미지 스냅샷
  image: {
    type: String,
    required: true,
    trim: true
  }
}, {
  _id: true,
  timestamps: false
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: {
    type: [cartItemSchema],
    default: []
  }
}, {
  timestamps: true
});

// 사용자별 장바구니 유니크 인덱스
cartSchema.index({ user: 1 }, { unique: true });

// 총 금액 계산을 위한 가상 필드
cartSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// 총 아이템 수 계산을 위한 가상 필드
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
});

// JSON 변환 시 가상 필드 포함
cartSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Cart', cartSchema);

