const mongoose = require('mongoose');

const productReqSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'A description is required'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
  },
});

const ProductReq = mongoose.model('ProductReq', productReqSchema);

module.exports = ProductReq;
