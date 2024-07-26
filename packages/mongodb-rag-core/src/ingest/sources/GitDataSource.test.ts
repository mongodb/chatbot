import { makeGitDataSource } from "./GitDataSource";
jest.setTimeout(90000);
describe("GitDataSource", () => {
  it("should load and process a real repo", async () => {
    const dataSource = makeGitDataSource({
      name: "sample",
      repoUri: "https://github.com/mongodb/chatbot.git",
      repoOptions: {
        "--depth": 1,
        "--branch": "main",
      },
      filter: (path: string) =>
        path.endsWith(".md") && path.includes("docs/docs"),
      metadata: {
        foo: "bar",
      },
      handlePage: async (path) => [
        {
          url: "https://example.com/" + path,
          title: "sample",
          body: "sample",
          format: "md",
        },
      ],
    });
    const pages = await dataSource.fetchPages();
    expect(pages.length).toBeGreaterThanOrEqual(1);
  });
});
