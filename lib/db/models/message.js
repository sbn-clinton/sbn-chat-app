const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  id: {
    type: String,
    required: true,
    unique: true,
  },
  sender: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  // For system messages like user joined/left
  isSystem: {
    type: Boolean,
    default: false,
  },
})

// Create the model if it doesn't exist or use the existing one
const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)

module.exports = Message
