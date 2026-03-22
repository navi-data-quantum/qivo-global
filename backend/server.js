const http = require("http");
const app = require("./src/app");
const pool = require("./src/config/db");
const config = require("./src/config/env");
const { initGeo } = require("./src/services/geoService");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("joinSession", ({ sessionId }) => {
    socket.join(`session_${sessionId}`);
  });

  socket.on("typing", ({ sessionId, userId }) => {
    socket.to(`session_${sessionId}`).emit("typing", { userId });
  });

  socket.on("sendMessage", ({ sessionId, message }) => {
    io.to(`session_${sessionId}`).emit("newMessage", message);
  });

  socket.on("disconnect", () => {});
});

async function startServer() {
  try {
    await pool.connectDB();
    await initGeo();

    server.listen(config.server.port, config.server.host, () => {
      console.log(`🚀 Server running on ${config.server.host}:${config.server.port}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log("🌎 GeoIP Ready ✅");
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();








