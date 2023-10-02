import { makeRstOnGitHubDataSource } from "./RstOnGitHubDataSource";

// Ensure you have a read-only GITHUB_ACCESS_TOKEN in the .env file -- this
// avoids 403 errors due to unauthenticated GitHub API overuse
import "dotenv/config";

describe("makeRstOnGitHubDataSource", () => {
  jest.setTimeout(60000);

  it("loads and processes a real repo", async () => {
    const source = await makeRstOnGitHubDataSource({
      name: "python-TEST",
      repoUrl: "https://github.com/mongodb/mongo-python-driver",
      repoLoaderOptions: {
        branch: "4.5.0",
        ignoreFiles: [/^(?!\/doc\/).*/], // Everything BUT doc/
      },
      pathToPageUrl(path) {
        return path
          .replace(/^\/doc\//, "https://pymongo.readthedocs.io/en/4.5.0/")
          .replace(/\.rst$/, ".html");
      },
      getMetadata({ url }) {
        return { test: "It works!", url };
      },
    });
    const pages = await source.fetchPages();
    expect(pages.length).toBe(82);
    expect(pages[0].url).toBe(
      "https://pymongo.readthedocs.io/en/4.5.0/api/bson/binary.html"
    );
    expect(pages[0].format).toBe("md");
    expect(pages[0].sourceName).toBe("python-TEST");
    expect(pages[0].body).toContain(
      "# :mod:`binary` -- Tools for representing binary data to be stored in MongoDB"
    );

    // Fetches title
    expect(pages[0].title).toBe(
      ":mod:`binary` -- Tools for representing binary data to be stored in MongoDB"
    );

    // Adds metadata
    expect(pages[0].metadata).toStrictEqual({
      test: "It works!",
      url: "https://pymongo.readthedocs.io/en/4.5.0/api/bson/binary.html",
    });
  });
});
