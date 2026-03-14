const { Pool } = require("pg");
const config = require("./env");
const logger = require("../utils/logger");

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  ssl: config.database.ssl,
  max: config.database.max || 10,
  idleTimeoutMillis: config.database.idleTimeoutMillis || 30000,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis || 5000,
});

const connectDB = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      await pool.query("SELECT 1");
      logger.info("PostgreSQL Connected");
      return;
    } catch (err) {
      logger.error(`DB retry ${i + 1}/10 — ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  process.exit(1);
};

pool.on("error", (err) => {
  logger.error("Unexpected PG error", err);
});

module.exports = pool;
module.exports.connectDB = connectDB;














