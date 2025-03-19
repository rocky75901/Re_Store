const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    ref: 'User'
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
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1
    },
    price: {
      type: Number,
      required: [true, 'Price is required']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping address is required']
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
