import { makeGitDataSource } from "./GitDataSource";
jest.setTimeout(60000);
describe("GitDataSource", () => {
  it("should load and process a real repo", async () => {
    const dataSource = await makeGitDataSource({
      name: "sample",
      repoUri: "https://github.com/mongodb/mongo-java-driver.git",
      repoOptions: {
        "--depth": 1,
        "--branch": "gh-pages",
      },
      filter: (path: string) =>
        path.endsWith(".html") &&
        path.includes("4.10") &&
        path.includes("driver-reactive"),
      metadata: {
        foo: "bar",
      },
      handlePage: async (path, content, options) => [
        {
          sourceName: options.sourceName,
          url: "https://example.com/" + path,
          title: "sample",
          body: "sample",
          metadata: options.metadata,
          format: "md",
        },
      ],
    });
    const pages = await dataSource.fetchPages();
    expect(pages.length).toBeGreaterThanOrEqual(1);
  });
});
