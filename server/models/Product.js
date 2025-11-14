const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['상의', '하의', '악세사리'],
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// SKU 유니크 인덱스 (명시적 설정)
productSchema.index({ sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
