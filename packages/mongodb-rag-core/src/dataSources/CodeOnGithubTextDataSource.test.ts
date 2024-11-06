import {
  MakeCodeOnGithubTextDataSourceParams,
  makeCodeOnGithubTextDataSource,
  pageBlobUrl,
} from "./CodeOnGithubTextDataSource";
import "dotenv/config";
import { Page } from "../contentStore";
import { DataSource } from "./DataSource";

jest.setTimeout(60000);

export function samplePathToPage(pathInRepo: string) {
  if (pathInRepo.endsWith("_index.md")) {
    pathInRepo = pathInRepo.replace("_index.md", "index.md");
  }
  return pathInRepo
    .replace(/^docs\/content\/mongocxx-v3/, "https://example/com")
    .replace(/\.md$/, "/");
}
const sampleConf: MakeCodeOnGithubTextDataSourceParams = {
  name: "nodejs-quickstart",
  repoUrl: "https://github.com/mongodb-developer/nodejs-quickstart/",
  repoLoaderOptions: {
    branch: "master",
    recursive: true,
    ignoreFiles: ["LICENSE"],
  },
  metadata: {
    productName: "mongodb-developer/nodejs-quickstart",
  },
};

describe("CodeExampleOnGithubDataSource", () => {
  let dataSource: DataSource;
  let pages: Page[];

  beforeAll(async () => {
    dataSource = await makeCodeOnGithubTextDataSource(sampleConf);
    pages = await dataSource.fetchPages();
  });

  it("loads the full text of relevant code files", async () => {
    expect(pages.length).toBeGreaterThan(0);
    const samplePage = pages.find(
      (page) =>
        page.url ===
        "https://github.com/mongodb-developer/nodejs-quickstart/blob/master/usersCollection.js"
    );
    expect(samplePage).toBeDefined();
    expect(samplePage?.body).toContain(
      "const { MongoClient } = require('mongodb');"
    );
    expect(samplePage?.body).toContain("/**\n * This script");
  });

  it("does not load git metadata", async () => {
    const gitFiles = pages.filter((page) => page.url.includes(".git"));
    expect(gitFiles.length).toBe(0);
  });

  it("does not load non-code files like LICENSE and CONTRIBUTING files", async () => {
    const licenseFiles = pages.filter((page) => page.url.includes("LICENSE"));
    expect(licenseFiles.length).toBe(0);
  });

  it("allows you to ignore arbitrary files", async () => {
    const dataSource = await makeCodeOnGithubTextDataSource({
      ...sampleConf,
      repoLoaderOptions: {
        ...sampleConf.repoLoaderOptions,
        ignoreFiles: [/usersCollection/],
      },
    });
    const pages = await dataSource.fetchPages();
    expect(pages.length).toBeGreaterThan(0);
    const ignoredFile = pages.find((page) =>
      page.url.includes("usersCollection.js")
    );
    expect(ignoredFile).toBeUndefined();
  });
});

describe("pageBlobUrl", () => {
  it("returns the correct URL for a given path", () => {
    const exampleRepoUrl = "https://github.com/mycorp/myrepo";

    expect(
      pageBlobUrl({
        repoUrl: exampleRepoUrl,
        branch: "main",
        filePath: "src/index.js",
      })
    ).toBe("https://github.com/mycorp/myrepo/blob/main/src/index.js");

    expect(
      pageBlobUrl({
        repoUrl: exampleRepoUrl + "/",
        branch: "fix/bug",
        filePath: "/src/deeply/nested/index.js",
      })
    ).toBe(
      "https://github.com/mycorp/myrepo/blob/fix/bug/src/deeply/nested/index.js"
    );
  });
});
