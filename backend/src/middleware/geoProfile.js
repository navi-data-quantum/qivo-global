const pool = require("../config/db");
const { getCountryFromIP } = require("../services/geoService");

const privateIPRanges = ["127.0.0.1", "::1", "10.", "172.", "192.168"];

const getClientIP = (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    req.ip;

  if (ip?.includes("::ffff:")) ip = ip.replace("::ffff:", "");
  return ip || null;
};

const geoProfile = async (req, res, next) => {
  const ip = getClientIP(req);
  req.clientIP = ip;

  if (!ip || privateIPRanges.some((range) => ip.startsWith(range))) {
    req.country = "LOCAL";
    req.geoProfile = null;
    return next();
  }

  try {
    const countryCode = getCountryFromIP(ip);
    if (!countryCode) {
      req.country = "UNKNOWN";
      req.geoProfile = null;
      return next();
    }

    const { rows } = await pool.query(
      `SELECT * FROM country_full_info_final WHERE country_code = $1`,
      [countryCode]
    );

    req.geoProfile = rows[0] || null;
    req.country = countryCode;

    next();
  } catch (err) {
    console.error("Geo Error:", err);
    req.country = "UNKNOWN";
    req.geoProfile = null;
    next();
  }
};

module.exports = geoProfile;