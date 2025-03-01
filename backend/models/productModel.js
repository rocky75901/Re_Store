const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have name'],
  },
  description: {
    type: String,
    required: [true, 'A product must have description'],
  },
  price: {
    type: Number,
    required: [true, 'A product must have price'],
  },
  sellerId: {
    type: Number, //mongoose.Schema.Types.ObjectID
    required: [true, 'A product must have seller'],
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
