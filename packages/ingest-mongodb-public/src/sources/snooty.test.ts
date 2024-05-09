import {
  makeSnootyDataSources,
  snootyProjectConfig,
  snootyDataApiBaseUrl,
} from "./snooty";

describe("Snooty data sources", () => {
  // Skip the "landing" site to avoid an issue with the Snooty Data API. Remove this filter when the issue is fixed.
  const projectConfigs = snootyProjectConfig.filter(p => p.name !== "landing");
  test.each(projectConfigs)("$name should fetch data", async (project) => {
    const [source] = await makeSnootyDataSources(snootyDataApiBaseUrl, [
      project,
    ]);
    expect(source.name).toBeDefined();
  });
});
