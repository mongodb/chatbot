import { cppSourceConstructor } from "./cppDriver";

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
