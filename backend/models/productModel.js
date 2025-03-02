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
    type: Number, //mongoose.Schema.Types.ObjectID
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

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
