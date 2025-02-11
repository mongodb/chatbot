// import { loadConfigFile } from "./config";
import { generate } from "./generate";

import config from "./atlas-cli.config";
import { validateConfig } from "./config";

async function main() {
  // const config = await loadConfigFile("./atlas-cli.config.js");
  return await generate(validateConfig(config), {
    current: "1.11.0",
    previous: "1.10.0",
  });
}

describe("generateChangelogs", () => {
  it("should generate changelogs", async () => {
    const changes = await main();
    expect(changes).toBeDefined();
  });
});
