import { javaQuickstart } from "./mongodbDeveloperCodeRepos";

jest.setTimeout(90000);
describe("mongodbDeveloperCodeRepos", () => {
  it("correctly loads files", async () => {
    const source = await javaQuickstart();
    const pages = await source.fetchPages();
    expect(pages.length).toBeGreaterThan(0);
    const samplePage = pages.find((page) =>
      page.url.includes("AggregationFramework.java")
    );
    expect(samplePage?.url).toBe(
      "https://github.com/mongodb-developer/java-quick-start/blob/main/src/main/java/com/mongodb/quickstart/AggregationFramework.java"
    );
  });
});
