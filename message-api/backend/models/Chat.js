import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
  },
  { timestamps: true }
);

// Update the updatedAt timestamp before saving
chatSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensure participants array always has exactly 2 users
chatSchema.pre("save", function (next) {
  if (this.participants.length !== 2) {
    next(new Error("Chat must have exactly 2 participants"));
  } else {
    next();
  }
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
