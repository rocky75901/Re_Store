const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have name'],
  },
  usedFor: {
    type: Number,
    required: [true, 'A product must have its age'],
  },
  condition: {
    type: String,
    trim: true,
    required: [true, 'A product must have its condition'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A product must have description'],
  },
  buyingPrice: {
    type: Number,
    required: [true, 'A product must have buying price'],
  },
  sellingPrice: {
    type: Number,
    required: [true, 'A product must have selling price'],
  },
  sellerId: {
    type: String,
    required: [true, 'A product must have seller'],
  },
  imageCover: {
    type: String,
    required: [true, 'A product must have a cover image'],
  },
  images: {
    type: [String],
    required: [true, 'A product must have images'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

// Add index for faster seller lookups
productSchema.index({ sellerId: 1 });

// Populate seller details when querying products
productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'sellerId',
    select: 'name username email'
  });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
