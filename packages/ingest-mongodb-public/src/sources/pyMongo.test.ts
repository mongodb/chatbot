import { pyMongoSourceConstructor } from "./pyMongo";

describe("pyMongo", () => {
  it("has titles", async () => {
    const source = await pyMongoSourceConstructor();
    const pages = await source.fetchPages();
    expect(pages.length).toBeGreaterThan(0);
    expect(pages[0].title).toBeTruthy();
    expect(pages[0].url).toMatch(
      /^https:\/\/pymongo.readthedocs.io\/en\/stable\/[A-z./]+\.html$/
    );
  });
});
