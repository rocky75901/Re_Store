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
<<<<<<< HEAD
  condition: {
    type: String,
    required: [true, 'Product condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  usedFor: {
    type: Number,
    required: [true, 'Used duration is required']
=======
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A product must have seller'],
>>>>>>> be1c2590d5ee31e05da06b1ecd920e67b4f3f7f1
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

<<<<<<< HEAD
// Add index for faster auction queries
productSchema.index({ isAuction: 1 });
productSchema.index({ sellingType: 1 });
=======
// Add index for faster seller lookups
productSchema.index({ sellerId: 1 });

// Populate seller details when querying products
productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'sellerId',
    select: 'name username email _id'
  });
  next();
});
>>>>>>> be1c2590d5ee31e05da06b1ecd920e67b4f3f7f1

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
