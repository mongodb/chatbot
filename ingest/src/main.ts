import yargs = require("yargs");

import "dotenv/config";

// Yargs is incompatible with ESM, so import manually here
import chunks from "./commands/chunks.js";
import pages from "./commands/pages.js";

async function main() {
  const argv = yargs.command([chunks, pages]).demandCommand();

  // Accessing this property executes CLI
  argv.argv;
}

main().catch(console.error);
