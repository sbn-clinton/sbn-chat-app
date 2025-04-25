const mongoose = require("mongoose")

// Track connection status
let isConnected = false

/**
 * Connect to MongoDB
 */
async function connectToDatabase() {
  if (isConnected) {
    console.log("=> Using existing database connection")
    return
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI)
    isConnected = db.connections[0].readyState === 1
    console.log("=> Connected to MongoDB")
  } catch (error) {
    console.error("=> Error connecting to MongoDB:", error)
  }
}

module.exports = { connectToDatabase }
