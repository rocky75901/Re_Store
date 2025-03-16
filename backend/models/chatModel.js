import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'messages'
  }
}, { timestamps: true });

// Ensure participants array always has exactly 2 users
chatSchema.pre('save', function (next) {
  if (this.participants.length !== 2) {
    next(new Error('Chat must have exactly 2 participants'));
  } else {
    next();
  }
});

export default mongoose.model('chats', chatSchema); 