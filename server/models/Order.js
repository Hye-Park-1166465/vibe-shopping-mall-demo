const mongoose = require('mongoose');

// 주문 아이템 스키마
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    enum: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    required: false,
    trim: true
  }
}, {
  _id: true,
  timestamps: false
});

const orderSchema = new mongoose.Schema({
  // 주문번호 (고유 번호, 예: ORD-20240101-0001)
  orderNumber: {
    type: String,
    required: false, // pre('save') 미들웨어에서 자동 생성되므로 false로 설정
    unique: true,
    trim: true,
    uppercase: true
  },
  // 주문자
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 주문 아이템들
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: '주문에는 최소 1개 이상의 아이템이 필요합니다.'
    }
  },
  // 총 주문 금액
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // 주문 상태
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // 결제 방법
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'bank_transfer', 'virtual_account', 'kakao_pay', 'naver_pay'],
    trim: true
  },
  // 결제 상태
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  // 결제일시
  paidAt: {
    type: Date,
    required: false
  },
  // 포트원 결제 정보
  imp_uid: {
    type: String,
    required: false,
    trim: true,
    unique: true,
    sparse: true // null 값은 중복 허용
  },
  merchant_uid: {
    type: String,
    required: false,
    trim: true,
    unique: true,
    sparse: true // null 값은 중복 허용
  },
  // 배송지 정보
  shippingAddress: {
    type: String,
    required: true,
    trim: true
  },
  // 수령인 이름
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  // 수령인 전화번호
  recipientPhone: {
    type: String,
    required: true,
    trim: true
  },
  // 배송 상태
  shippingStatus: {
    type: String,
    required: true,
    enum: ['pending', 'preparing', 'shipped', 'in_transit', 'delivered', 'returned'],
    default: 'pending'
  },
  // 운송장 번호
  trackingNumber: {
    type: String,
    required: false,
    trim: true
  },
  // 배송 예정일
  estimatedDeliveryDate: {
    type: Date,
    required: false
  },
  // 배송 완료일
  deliveredAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// 주문번호 인덱스
orderSchema.index({ orderNumber: 1 }, { unique: true });

// 사용자별 주문 조회를 위한 인덱스
orderSchema.index({ user: 1, createdAt: -1 });

// 주문 상태별 조회를 위한 인덱스
orderSchema.index({ status: 1, createdAt: -1 });

// 결제 정보 중복 체크를 위한 인덱스
orderSchema.index({ imp_uid: 1 }, { unique: true, sparse: true });
orderSchema.index({ merchant_uid: 1 }, { unique: true, sparse: true });

// 총 아이템 수 계산을 위한 가상 필드
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
});

// JSON 변환 시 가상 필드 포함
orderSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// 주문번호 자동 생성 미들웨어 (저장 전)
orderSchema.pre('save', async function(next) {
  // 주문번호가 이미 있으면 생성하지 않음
  if (this.orderNumber) {
    return next();
  }
  
  try {
    // 날짜 기반 주문번호 생성 (예: ORD-20240101-0001)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 같은 날짜의 주문 개수 확인
    const todayOrders = await mongoose.model('Order').countDocuments({
      orderNumber: new RegExp(`^ORD-${dateStr}-`)
    });
    
    // 순번을 4자리 숫자로 포맷팅
    const sequence = String(todayOrders + 1).padStart(4, '0');
    this.orderNumber = `ORD-${dateStr}-${sequence}`;
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Order', orderSchema);

