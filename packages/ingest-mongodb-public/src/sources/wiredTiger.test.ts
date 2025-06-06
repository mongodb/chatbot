import { wiredTigerSourceConstructor } from "./wiredTiger";
jest.setTimeout(50000);

describe("wiredTigerSourceConstructor", () => {
  it("should load files", async () => {
    const wiredTigerSource = await wiredTigerSourceConstructor();

    const pages = await wiredTigerSource.fetchPages();

    expect(pages.length).toBeGreaterThan(0);
  });
});
