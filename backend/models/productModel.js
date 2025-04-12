const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'A product must have a description'],
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'Electronics',
      'Clothing',
      'Home & Garden',
      'Toys & Games',
      'Books & Media',
      'Sports & Outdoors',
      'Health & Beauty',
      'Automotive',
      'Others',
    ],
    default: 'Others',
  },
  buyingPrice: {
    type: Number,
    required: function () {
      return this.sellingType === 'regular';
    },
    min: [0, 'Buying price cannot be negative'],
  },
  sellingPrice: {
    type: Number,
    required: [true, 'A product must have a selling price'],
    min: [0, 'Selling price cannot be negative'],
  },
  condition: {
    type: String,
    required: [true, 'Product condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
  },
  usedFor: {
    type: Number,
    required: [true, 'Used duration is required'],
    min: [0, 'Used duration cannot be negative'],
  },
  imageCover: {
    type: String,
    required: [true, 'A product must have a cover image'],
  },
  images: [String],
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A product must belong to a seller'],
  },
  isAuction: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  sellingType: {
    type: String,
    enum: ['regular', 'auction'],
    default: 'regular',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for faster auction queries
productSchema.index({ isAuction: 1 });
productSchema.index({ sellingType: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
