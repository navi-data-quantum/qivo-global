const geoip = require("maxmind");
const path = require("path");

let geoLookup = null;

(async () => {
  try {
    const dbPath = path.join(__dirname, "../geoip/GeoLite2-Country.mmdb");
    geoLookup = await geoip.open(dbPath);
  } catch (err) {
    console.error("Failed to load GeoIP database:", err);
  }
})();

const geoMiddleware = (req, res, next) => {
  const ip =
    req.query.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  req.clientIP = ip;

  if (!geoLookup || !ip) {
    req.country = "UNKNOWN";
    return next();
  }

  const result = geoLookup.get(ip);
  req.country = result?.country?.iso_code || "UNKNOWN";

  next();
};

module.exports = geoMiddleware;