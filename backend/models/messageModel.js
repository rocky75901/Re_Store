import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chats',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
}, { timestamps: true });

// Update the associated chat's lastMessage reference
messageSchema.post('save', async function(doc) {
  try {
    await mongoose.model('Chat').findByIdAndUpdate(
      doc.chatId,
      {
        lastMessage: doc._id,
        updatedAt: new Date()
      }
    );
  } catch (error) {
    console.error('Error updating chat lastMessage:', error);
  }
});

export default mongoose.model('messages', messageSchema); 