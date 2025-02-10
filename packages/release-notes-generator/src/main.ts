import { loadConfigFile } from "./config";
import { generate } from "./generate";

async function main() {
  const config = await loadConfigFile("./atlas-cli.config.js");
  await generate(config, {
    current: "1.11.0",
    previous: "1.10.0",
  });
}

main();
