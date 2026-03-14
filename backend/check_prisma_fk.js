const fs = require("fs");
const path = require("path");

// Auto-detect schema.prisma in project
function findSchemaPrisma(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isFile() && file.name === "schema.prisma") return fullPath;
    if (file.isDirectory()) {
      const found = findSchemaPrisma(fullPath);
      if (found) return found;
    }
  }
  return null;
}

const projectDir = __dirname;
const schemaPath = findSchemaPrisma(projectDir);

if (!schemaPath) {
  console.error("❌ schema.prisma not found in the project!");
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, "utf-8");

// Regex to capture all models
const modelRegex = /model\s+(\w+)\s+\{([\s\S]*?)\n\}/g;
// Regex to capture any field with @relation
const relationFieldRegex = /(\w+)\s+([\w\[\]]+)[^\n]*@relation[^\n]*/g;

console.log(`🔹 Checking all foreign keys in ${schemaPath} 🔹\n`);

const report = [];
let modelMatch;
while ((modelMatch = modelRegex.exec(schema)) !== null) {
  const modelName = modelMatch[1];
  const modelBody = modelMatch[2];

  let fieldMatch;
  while ((fieldMatch = relationFieldRegex.exec(modelBody)) !== null) {
    const fieldName = fieldMatch[1];
    const fieldType = fieldMatch[2];

    const fieldsMatch = fieldMatch[0].match(/fields:\s*\[([^\]]+)\]/);
    const referencesMatch = fieldMatch[0].match(/references:\s*\[([^\]]+)\]/);

    const fkFields = fieldsMatch ? fieldsMatch[1] : "N/A";
    const refFields = referencesMatch ? referencesMatch[1] : "N/A";

    console.log(`Table: ${modelName}`);
    console.log(`  Field: ${fieldName}`);
    console.log(`  Prisma type: ${fieldType}`);
    console.log(`  References: ${refFields}`);
    console.log(`  Foreign key field: ${fkFields}`);
    console.log("-------------------------------------------------");

    report.push({
      Table: modelName,
      Field: fieldName,
      PrismaType: fieldType,
      ForeignKeyField: fkFields,
      References: refFields,
    });
  }
}

// Save report as CSV
const csvHeader = "Table,Field,PrismaType,ForeignKeyField,References\n";
const csvContent =
  csvHeader +
  report
    .map(
      (r) =>
        `${r.Table},${r.Field},${r.PrismaType},${r.ForeignKeyField},${r.References}`
    )
    .join("\n");

fs.writeFileSync(path.join(projectDir, "prisma_fk_report.csv"), csvContent, "utf-8");

console.log("\n✅ Check complete. Report saved as prisma_fk_report.csv");