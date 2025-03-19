const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Cart item must have a product']
  },
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Product price is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Cart item must have a quantity'],
    min: [1, 'Quantity cannot be less than 1']
  }
});

const cartSchema = new mongoose.Schema({
  username: {
    type: String,
    ref: 'User',
    required: [true, 'Cart must belong to a user'],
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  }
});

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.sellingPrice * item.quantity);
  }, 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

