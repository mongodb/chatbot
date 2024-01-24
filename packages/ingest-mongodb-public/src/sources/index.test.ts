import {
  mongooseSourceConstructor,
  cppSourceConstructor,
  practicalAggregationsDataSource,
} from "./index";

describe("mongooseSourceConstructor", () => {
  it("correctly loads files", async () => {
    const source = await mongooseSourceConstructor();
    const pages = await source.fetchPages();
    expect(pages.length).toBeGreaterThan(0);
    expect(pages[0].title).toBeTruthy();
    expect(pages[0].url).toMatch(
      /^https:\/\/mongoosejs.com\/docs\/[A-z./]+\.html$/
    );
  });
});

describe("cppSourceConstructor", () => {
  it("correctly loads files", async () => {
    const source = await cppSourceConstructor();
    const pages = await source.fetchPages();
    expect(pages.length).toBeGreaterThan(0);
    expect(pages[0].title).toBeTruthy();
    expect(pages[0].url).toMatch(
      /^https:\/\/mongocxx.org\/mongocxx-v3\/[A-z./]+\/$/
    );
  });
});

describe("practicalAggregationsDataSource", () => {
  it("correctly loads files", async () => {
    const source = await practicalAggregationsDataSource();
    const pages = await source.fetchPages();
    expect(pages.length).toBeGreaterThan(0);
    expect(pages[0].title).toBeTruthy();
    expect(pages[0].url).toMatch(
      /^https:\/\/www.practical-mongodb-aggregations.com\/src\/[A-z./]+$/
    );
  });
});
