const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return !v.includes('@');
      },
      message: props => `${props.value} is not a valid username format`
    }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    name: {
      type: String,
      required: [true, 'Product name is required']
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Product price is required']
    },
    image: {
      type: String,
      default: null
    }
  }]
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
