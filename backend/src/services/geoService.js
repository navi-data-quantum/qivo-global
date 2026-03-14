const maxmind = require("maxmind");
const path = require("path");

let lookup;

async function initGeo() {
  const dbPath = path.join(__dirname, "../geoip/GeoLite2-Country.mmdb");
  lookup = await maxmind.open(dbPath);
}

function getCountryFromIP(ip) {
  if (!lookup) return null;
  const result = lookup.get(ip);
  return result?.country?.iso_code || null;
}

module.exports = { initGeo, getCountryFromIP };
