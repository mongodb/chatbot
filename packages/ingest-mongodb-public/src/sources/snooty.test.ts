import {
  makeSnootyDataSources,
  snootyProjectConfig,
  snootyDataApiBaseUrl,
} from "./snooty";

describe("Snooty data sources", () => {
  test.each(snootyProjectConfig)("$name should fetch data", async (project) => {
    const [source] = await makeSnootyDataSources(snootyDataApiBaseUrl, [
      project,
    ]);
    expect(source.name).toBeDefined();
  });
});
