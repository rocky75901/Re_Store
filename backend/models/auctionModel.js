const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  seller: {
    type: String,
    required: [true, 'Seller username is required'],
    ref: 'User'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required']
  },
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required']
  },
  bids: [{
    bidder: {
      type: String,
      required: [true, 'Bidder username is required'],
      ref: 'User'
    },
    amount: {
      type: Number,
      required: [true, 'Bid amount is required']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'cancelled'],
    default: 'pending'
  },
  winner: {
    type: String,
    ref: 'User'
  },
  finalPrice: {
    type: Number
  }
});

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction;
