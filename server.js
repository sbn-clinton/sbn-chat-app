const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { initSocketServer } = require("./lib/socket-server.js")
const { connectToDatabase } = require("./lib/db/connect.js")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config({ path: ".env.local" })

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = process.env.PORT || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Connect to MongoDB when server starts
connectToDatabase().catch((err) => {
  console.error("Failed to connect to MongoDB", err)
})

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Handle socket.io polling requests
      if (req.url && req.url.startsWith("/api/socket")) {
        res.writeHead(404)
        res.end("Not found - use /api/socketio instead")
        return
      }

      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  // Initialize Socket.io
  initSocketServer(server)

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> MongoDB URI: ${process.env.MONGODB_URI ? "Set" : "Not set"}`)
  })
})
