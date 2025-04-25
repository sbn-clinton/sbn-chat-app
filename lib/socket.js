const { io } = require("socket.io-client")

let socket = null

function initializeSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
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
