const { Server: SocketIOServer } = require("socket.io")
const { v4: uuidv4 } = require("uuid")
const { connectToDatabase } = require("./db/connect")
const Room = require("./db/models/room")
const Message = require("./db/models/message")





// In-memory storage for active users
const users = []

// Get users in a room
function getRoomUsers(room) {
  return users.filter((user) => user.room === room)
}

// Add user to chat
function userJoin(id, name, room) {
  const user = { id, name, room }
  users.push(user)
  return user
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id)
  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

// Save message to database
async function saveMessage(message) {
  try {
    await connectToDatabase()
    const newMessage = new Message(message)
    await newMessage.save()
    return newMessage
  } catch (error) {
    console.error("Error saving message:", error)
    return null
  }
}

// Get messages for a room
async function getRoomMessages(roomId) {
  try {
    await connectToDatabase()
    // Get the last 50 messages, sorted by timestamp
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 }).limit(50)
    return messages
  } catch (error) {
    console.error("Error getting room messages:", error)
    return []
  }
}

// Create or update room
async function saveRoom(roomData) {
  try {
    await connectToDatabase()
    const room = await Room.findOneAndUpdate(
      { roomId: roomData.roomId },
      {
        ...roomData,
        lastActivity: Date.now(),
      },
      { upsert: true, new: true },
    )
    return room
  } catch (error) {
    console.error("Error saving room:", error)
    return null
  }
}

// Get room by ID
async function getRoomById(roomId) {
  try {
    await connectToDatabase()
    const room = await Room.findOne({ roomId })
    return room
  } catch (error) {
    console.error("Error getting room:", error)
    return null
  }
}

function initSocketServer(server) {
  const io = new SocketIOServer(server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: "https://sbn-chat-app.vercel.app", // your frontend
      methods: ["GET", "POST"],
      credentials: true
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Join a room
    socket.on("joinRoom", async ({ roomId, username, isCreator, roomName }) => {
      try {
        console.log(
          `User ${username} attempting to join room ${roomId}, isCreator: ${isCreator}, roomName: ${roomName}`,
        )

        // Connect to database
        await connectToDatabase()

        // Check if room exists
        let room = await getRoomById(roomId)
        console.log("Room found in database:", room ? "Yes" : "No")

        // If user is creator and room doesn't exist, create it
        if (isCreator) {
          if (!room) {
            console.log(`Creating new room: ${roomId} - ${roomName}`)
            room = await saveRoom({
              roomId,
              name: roomName || `Room ${roomId}`,
              createdBy: username,
            })
            console.log("Room created:", room ? "Success" : "Failed")
          } else {
            console.log(`Room ${roomId} already exists, joining as creator`)
          }
        }

        // If room doesn't exist and user is not creator, return error
        if (!room && !isCreator) {
          console.log(`Room ${roomId} not found and user is not creator`)
          socket.emit("error", {
            message: "Room not found",
          })
          return
        }

        // Add user to room
        const user = userJoin(socket.id, username, roomId)
        socket.join(user.room)
        console.log(`User ${username} joined room ${roomId}`)

        // Get room messages
        const messages = await getRoomMessages(roomId)
        console.log(`Retrieved ${messages.length} messages for room ${roomId}`)

        // Send previous messages to the user
        socket.emit("previousMessages", messages)

        // Welcome message
        const welcomeMessage = {
          id: uuidv4(),
          roomId,
          sender: "ChatBot",
          text: `Welcome to the chat, ${user.name}!`,
          timestamp: Date.now(),
          isSystem: true,
        }

        // Save and send welcome message
        await saveMessage(welcomeMessage)
        socket.emit("message", welcomeMessage)

        // Broadcast when a user connects
        const userJoinedMessage = {
          id: uuidv4(),
          roomId,
          sender: "ChatBot",
          text: `${user.name} has joined the chat`,
          timestamp: Date.now(),
          isSystem: true,
        }

        // Save and broadcast user joined message
        await saveMessage(userJoinedMessage)
        socket.to(user.room).emit("message", userJoinedMessage)

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        })
      } catch (error) {
        console.error("Error in joinRoom:", error)
        socket.emit("error", {
          message: "Failed to join room: " + (error.message || "Unknown error"),
        })
      }
    })

    // Listen for chat messages
    socket.on("chatMessage", async ({ roomId, text }) => {
      try {
        const user = users.find((u) => u.id === socket.id)

        if (user) {
          // Update room's last activity
          await saveRoom({
            roomId: user.room,
            lastActivity: Date.now(),
          })

          // Create message object
          const message = {
            id: uuidv4(),
            roomId: user.room,
            sender: user.name,
            text,
            timestamp: Date.now(),
          }

          // Save message to database
          await saveMessage(message)

          // Send message to all users in the room
          io.to(user.room).emit("message", message)
        }
      } catch (error) {
        console.error("Error in chatMessage:", error)
      }
    })

    // Runs when client disconnects
    socket.on("disconnect", async () => {
      try {
        const user = userLeave(socket.id)

        if (user) {
          // Create user left message
          const userLeftMessage = {
            id: uuidv4(),
            roomId: user.room,
            sender: "ChatBot",
            text: `${user.name} has left the chat`,
            timestamp: Date.now(),
            isSystem: true,
          }

          // Save and broadcast user left message
          await saveMessage(userLeftMessage)
          io.to(user.room).emit("message", userLeftMessage)

          // Send users and room info
          io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
          })
        }
      } catch (error) {
        console.error("Error in disconnect:", error)
      }
    })
  })

  return io
}

module.exports = { initSocketServer }
