const http = require("http");
const app = require("./src/app");
const pool = require("./src/config/db");
const config = require("./src/config/env");
const { initGeo } = require("./src/services/geoService");

const server = http.createServer(app);

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








