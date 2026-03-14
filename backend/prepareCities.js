const fs = require("fs");
const readline = require("readline");
const path = require("path");

const input = path.join(__dirname, "data", "allCountries.txt");
const output = path.join(__dirname, "data", "cities_ready.txt");

const rl = readline.createInterface({
  input: fs.createReadStream(input),
  crlfDelay: Infinity,
});

const out = fs.createWriteStream(output);

(async () => {
  let count = 0;

  for await (const line of rl) {
    const c = line.split("\t");

    const geoname_id = c[0];
    const name = c[1];
    const lat = c[4];
    const lon = c[5];
    const feature_class = c[6];
    const feature_code = c[7];
    const country = c[8];
    const population = parseInt(c[14] || "0", 10);
    const timezone = c[17];

    if (
      feature_class === "P" &&
      feature_code.startsWith("PPL") &&
      population > 5000
    ) {
      out.write(
        `${geoname_id}\t${name}\t${country}\t${population}\t${lat}\t${lon}\t${timezone}\n`
      );
      count++;
    }
  }

  console.log("Cities ready:", count);
  process.exit();
})();