require("dotenv").config();

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

const config = {
  env,
  server: {
    host: process.env.HOST || "0.0.0.0",
    port: Number(process.env.PORT) || 5000,
  },
  database: {
    host: process.env.DB_HOST || "postgres",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "postgres",
    ssl: isProduction ? (process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false) : false,
    max: Number(process.env.DB_MAX) || 10,
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT) || 2000,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "dev_secret",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  logLevel: process.env.LOG_LEVEL || "info",
};

module.exports = config;





