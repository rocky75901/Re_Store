const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'A product must have a description']
  },
  buyingPrice: {
    type: Number,
    required: [true, 'A product must have a buying price']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'A product must have a selling price']
  },
  condition: {
    type: String,
    required: [true, 'Product condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  usedFor: {
    type: Number,
    required: [true, 'Used duration is required']
  },
  imageCover: {
    type: String,
    required: [true, 'A product must have a cover image']
  },
  images: [String],
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A product must belong to a seller']
  },
  isAuction: {
    type: Boolean,
    default: false
  },
  sellingType: {
    type: String,
    enum: ['regular', 'auction'],
    default: 'regular'
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// Add index for faster auction queries
productSchema.index({ isAuction: 1 });
productSchema.index({ sellingType: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
