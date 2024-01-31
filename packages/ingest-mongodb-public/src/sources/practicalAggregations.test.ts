import { practicalAggregationsDataSource } from "./practicalAggregations";

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
