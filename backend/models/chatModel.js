const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { timestamps: true });

// Ensure participants array always has exactly 2 users
chatSchema.pre('save', function(next) {
  if (!Array.isArray(this.participants)) {
    return next(new Error('Participants must be an array'));
  }
  
  if (this.participants.length !== 2) {
    return next(new Error('Chat must have exactly 2 participants'));
  }
  
  // Sort participants to ensure consistent order
  this.participants.sort();
  
  // Ensure participants are unique
  const uniqueParticipants = new Set(this.participants.map(p => p.toString()));
  if (uniqueParticipants.size !== 2) {
    return next(new Error('Chat participants must be unique'));
  }
  
  next();
});

// Remove ALL indexes from the collection (will be rebuilt when server restarts)
chatSchema.index({}, { sparse: true, background: true });

module.exports = mongoose.model('Chat', chatSchema); 