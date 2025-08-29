import {
  snootyProjectConfig,
  makeSnootyDataSources,
  snootyDataApiBaseUrl,
} from "./snootySources";

jest.setTimeout(20000);
describe("Snooty data sources", () => {
  jest.retryTimes(3, { waitBeforeRetry: 5000, logErrorsBeforeRetry: true });
  test.each(snootyProjectConfig)("$name should fetch data", async (project) => {
    const [source] = await makeSnootyDataSources(snootyDataApiBaseUrl, [
      project,
    ]);
    expect(source.name).toBeDefined();
  });
});
