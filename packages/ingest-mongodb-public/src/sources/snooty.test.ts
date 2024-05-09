import {
  snootySourceConstructor,
  snootyProjectConfig,
  snootyDataApiBaseUrl,
} from "./snooty";

// Skipping for now b/c of issue with the "landing" site. UNskip when the issue is resolved.
describe.skip("Snooty data sources", () => {
  test.each(snootyProjectConfig)("$name should fetch data", async (project) => {
    const [source] = await snootySourceConstructor(snootyDataApiBaseUrl, [
      project,
    ]);
    expect(source.name).toBeDefined();
  });
});
