const { v4: uuidv4 } = require("uuid");
const { getCountryFromIP } = require("../services/geoService");

const superRequestMiddleware = async (req, res, next) => {
  req.id = uuidv4();
  res.setHeader("X-Request-Id", req.id);

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
  req.clientIP = ip;
  req.country = getCountryFromIP(ip) || "UNKNOWN";

  req.startTime = Date.now();

  next();
};

module.exports = superRequestMiddleware;