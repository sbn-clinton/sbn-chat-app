const { io } = require("socket.io-client")

let socket = null

function initializeSocket() {
  if (!socket) {
    socket = io( "https://sbn-chat-app.vercel.app", {
      path: "/api/socketio",
    })
  }
  return socket
}

function getSocket() {
  return socket
}

function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

module.exports = {
  initializeSocket,
  getSocket,
  disconnectSocket,
}
