import { terraformProviderDataSource } from "./terraformProvider";

describe("terraformProvider", () => {
  it("should get pages", async () => {
    const terraformSource = await terraformProviderDataSource();

    const pages = await terraformSource.fetchPages();

    expect(pages.length).toBeGreaterThan(0);
  });
});
