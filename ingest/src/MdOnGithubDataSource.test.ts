import {
  MakeMdOnGithubDataSourceParams,
  makeMdOnGithubDataSource,
} from "./MdOnGithubDataSource";
import { mongoDbCppDriverConfig } from "./projectSources";
import "dotenv/config";
import { strict as assert } from "assert";
import { DataSource } from "./DataSource";
import { Page } from "chat-core";

jest.setTimeout(60000);

export function samplePathToPage(pathInRepo: string) {
  if (pathInRepo.endsWith("_index.md")) {
    pathInRepo = pathInRepo.replace("_index.md", "index.md");
  }
  return pathInRepo
    .replace(/^docs\/content\/mongocxx-v3/, "https://example/com")
    .replace(/\.md$/, "/");
}
const sampleConf: MakeMdOnGithubDataSourceParams = {
  name: "sample",
  repoUrl: "https://github.com/mongodb/mongo-cxx-driver/",
  repoLoaderOptions: {
    branch: "master",
    ignoreFiles: [/^(?!^docs\/content\/mongocxx-v3\/).*/],
  },
  pathToPageUrl: samplePathToPage,
  metadata: {
    productName: "C++ Driver (mongocxx)",
  },
  frontMatter: {
    process: true,
    separator: "+++",
    format: "toml",
  },
  extractTitle: (_, frontmatter) => (frontmatter?.title as string) ?? null,
  extractMetadata: () => ({
    foo: "bar",
  }),
};
describe("MdOnGithubDataSource", () => {
  let pages: Page[];
  beforeAll(async () => {
    const dataSource = await makeMdOnGithubDataSource(sampleConf);
    pages = await dataSource.fetchPages();
  });
  it("loads and processes a real repo of markdown files", async () => {
    const samplePage = pages.find((page) =>
      page.title?.includes("Installing the mongocxx driver")
    );
    assert(samplePage);
    expect(samplePage?.body).toContain("install");
  });
  it("processes metadata", () => {
    const samplePage = pages[0];
    expect(samplePage.metadata).toHaveProperty("foo", "bar");
    expect(samplePage.metadata).toHaveProperty(
      "productName",
      "C++ Driver (mongocxx)"
    );
  });
  it("removes frontmatter from page body", () => {
    const samplePage = pages[0];
    expect(samplePage.body).not.toContain("+++");
  });
  it("extracts title from frontmatter", () => {
    const samplePage = pages[0];
    expect(samplePage.title).toBeTruthy();
  });
});
