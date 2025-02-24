// A CLI script that accepts a docs rST file path and an updated meta description
// The script will update the meta description in the rST file in place
// Usage: node build/upsertMetaDirective.js <path-to-rst-file> <meta-description>

import path from "path";
import fs from "fs";
import { upsertMetaDirectiveInFile } from "./meta2rst";

const args = process.argv.slice(2);

const filePath = path.resolve(args[0]);
if (!fs.existsSync(filePath)) {
  console.error(`File does not exist: ${filePath}`);
  process.exit(1);
}

const metaDescription = args[1];
if (!metaDescription) {
  console.error("Meta description is required");
  process.exit(1);
}

try {
  upsertMetaDirectiveInFile(filePath, {
    description: metaDescription,
    keywords: null,
  });
  console.log(`Updated meta description in ${filePath}`);
  process.exit(0);
} catch (error) {
  console.error(`Error updating meta description in ${filePath}: ${error}`);
  process.exit(1);
}
