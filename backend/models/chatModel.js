const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure participants array always has exactly 2 users
chatSchema.pre('save', function (next) {
  if (this.participants.length !== 2) {
    next(new Error('Chat must have exactly 2 participants'));
  } else {
    next();
  }
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat; 