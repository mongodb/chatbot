import * as Path from "path";
import { makeSnootyDataSource } from "./SnootyDataSource";

describe("SnootyDataSource", () => {
  it("successfully loads pages", async () => {
    const source = await makeSnootyDataSource({
      manifestUrl: `file://${Path.resolve(
        __dirname,
        "../test/snooty_sample_data.txt"
      )}`,
      name: "snooty",
    });

    const pages = await source.fetchPages();
    expect(pages.length).toBe(12);
  });
});
