import Path from "path";
import { withConfig } from "./withConfig";

describe("withConfig", () => {
  it("loads a config file", async () => {
    await withConfig(
      async (config) => {
        expect(config.commands).toBeDefined();
        expect(config.evaluationStore).toBeDefined();
        expect(config.generatedDataStore).toBeDefined();
        expect(config.metadataStore).toBeDefined();
        expect(config.reportStore).toBeDefined();
        expect(config.afterAll).toBeDefined();
      },
      {
        config: Path.resolve(
          __dirname,
          "..",
          "testData",
          "config",
          "configTest.cjs"
        ),
      }
    );
  });
});
