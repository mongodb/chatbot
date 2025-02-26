// A CLI script that accepts a docs rST file path and an updated meta description
// The script will update the meta description in the rST file in place
// Usage: node build/upsertMetaDirective.js <path-to-rst-file> <meta-description>

import path from "path";
import fs from "fs";
import { upsertMetaDirectiveInFile } from "./meta2rst";
import { logger } from "mongodb-rag-core";

const args = process.argv.slice(2);

const filePathArg = args[0];
if (!filePathArg) {
  logger.error("File path is required");
  process.exit(1);
}

const filePath = path.resolve(filePathArg);
if (!fs.existsSync(filePath)) {
  logger.error(`File does not exist: ${filePath}`);
  process.exit(1);
}

const metaDescription = args[1];
if (!metaDescription) {
  logger.error("Meta description is required");
  process.exit(1);
}

try {
  upsertMetaDirectiveInFile(filePath, {
    description: metaDescription,
    keywords: null,
  });
  logger.info(`Updated meta description in ${filePath}`);
  process.exit(0);
} catch (error) {
  logger.error(`Error updating meta description in ${filePath}: ${error}`);
  process.exit(1);
}
