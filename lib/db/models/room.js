const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
})

// Create the model if it doesn't exist or use the existing one
const Room = mongoose.models.Room || mongoose.model("Room", roomSchema)

module.exports = Room
