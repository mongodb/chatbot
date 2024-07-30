import { makeGitHubDataSource } from "./GitHubDataSource";

// Ensure you have a read-only GITHUB_ACCESS_TOKEN in the .env file -- this
// avoids 403 errors due to unauthenticated GitHub API overuse
import "dotenv/config";

describe("makeGitHubDataSource", () => {
  jest.setTimeout(60000);

  it("loads and processes a real repo", async () => {
    let numDocs = 0;
    const source = await makeGitHubDataSource({
      name: "python-TEST",
      repoUrl: "https://github.com/mongodb/mongo-python-driver",
      repoLoaderOptions: {
        branch: "4.5.0",
        ignoreFiles: [/^(?!\/doc\/).*/], // Everything BUT /doc/
      },
      async handleDocumentInRepo(document) {
        numDocs++;
        // Can return multiple documents
        return [
          {
            body: document.pageContent,
            format: "txt",
            url: document.metadata.source,
          },
          {
            body: document.pageContent,
            format: "txt",
            url: `${document.metadata.source}-CLONE`,
          },
        ];
      },
    });
    const pages = await source.fetchPages();

    expect(pages.length).toBe(numDocs * 2);
    expect(pages[0].url).toBe("/doc/Makefile");
    expect(pages[1].url).toBe("/doc/Makefile-CLONE");

    expect(pages[0].format).toBe("txt");
    expect(pages[0].sourceName).toBe("python-TEST");
    expect(pages[0].body).toContain(
      "# Minimal makefile for Sphinx documentation"
    );
    expect(pages[1].body).toContain(
      "# Minimal makefile for Sphinx documentation"
    );
  });
  it("should use the `filter` option to filter out files", async () => {
    const mockFilter = jest.fn();
    const source = makeGitHubDataSource({
      name: "python-TEST",
      repoUrl: "https://github.com/mongodb/mongo-python-driver",
      filter: mockFilter,
      repoLoaderOptions: {
        branch: "4.5.0",
        ignoreFiles: [/^(?!\/doc\/).*/], // Everything BUT /doc/
      },
      async handleDocumentInRepo(document) {
        // Can return multiple documents
        return [
          {
            body: document.pageContent,
            format: "txt",
            url: document.metadata.source,
          },
          {
            body: document.pageContent,
            format: "txt",
            url: `${document.metadata.source}-CLONE`,
          },
        ];
      },
    });
    await source.fetchPages();
    expect(mockFilter).toHaveBeenCalled();
  });
});
