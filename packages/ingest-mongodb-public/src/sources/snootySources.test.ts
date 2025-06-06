import {
  snootyProjectConfig,
  makeSnootyDataSources,
  snootyDataApiBaseUrl,
} from "./snootySources";
jest.setTimeout(50000);

describe("Snooty data sources", () => {
  test.each(snootyProjectConfig)("$name should fetch data", async (project) => {
    const [source] = await makeSnootyDataSources(snootyDataApiBaseUrl, [
      project,
    ]);
    expect(source.name).toBeDefined();

    const pages = await source.fetchPages();
    expect(pages.length).toBeGreaterThan(0);
  });
});
