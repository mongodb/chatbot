import { mongooseSourceConstructor } from "./mongoose";

jest.setTimeout(90000);
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
