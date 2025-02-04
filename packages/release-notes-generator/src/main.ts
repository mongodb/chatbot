import { loadConfig } from "./config";
import { generate } from "./generate";

async function main() {
  const config = await loadConfig("./atlas-cli.config.js");
  await generate(config, {
    current: "1.11.0",
    previous: "1.10.0",
  });
}

main();
