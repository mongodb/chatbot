import {
  MakeMdOnGithubDataSourceParams,
  makeMdOnGithubDataSource,
} from "./MdOnGithubDataSource";
import "dotenv/config";
import { strict as assert } from "assert";
import { Page } from "../contentStore";
import Path from "path";

jest.setTimeout(60000);

const baseChatbotRepoConfig: MakeMdOnGithubDataSourceParams = {
  name: "chatbot",
  repoUrl: "https://github.com/mongodb/chatbot",
  repoLoaderOptions: {
    branch: "main",
  },
  pathToPageUrl: (path) => path,
  extractMetadata: () => ({
    foo: "bar",
  }),
};

const mongodbCorpConfig: MakeMdOnGithubDataSourceParams = {
  ...baseChatbotRepoConfig,
  name: "mongodb-corp",
  frontMatter: {
    process: true,
    separator: "---",
    format: "yaml",
  },
  metadata: {
    productName: "MongoDB Corp",
  },
  filter: (path) => path.includes("mongodb-corp"),
  extractTitle: (_, frontmatter) => (frontmatter?.title as string) ?? null,
};

const testDataConfig: MakeMdOnGithubDataSourceParams = {
  ...baseChatbotRepoConfig,
  name: "ingest_testData",
  metadata: {
    productName: "Ingest Test Data",
  },
  filter: (path) => path.includes(Path.join("mongodb-rag-core", "testData")),
};

describe("MdOnGithubDataSource", () => {
  let pages: Page[];
  const samplePages: Record<string, Page | undefined> = {};
  const getSamplePage = (path: string) => {
    const samplePage = samplePages[path];
    assert(samplePage);
    return samplePage;
  };
  beforeAll(async () => {
    const dataSource = await makeMdOnGithubDataSource(mongodbCorpConfig);
    pages = await dataSource.fetchPages();
    samplePages["mongodb-corp/chatbot/overview.md"] = pages.find((page) => {
      return page.url.includes("mongodb-corp/chatbot/overview.md");
    });
  });
  it("loads and processes a real repo of markdown files", async () => {
    const samplePage = getSamplePage("mongodb-corp/chatbot/overview.md");
    assert(samplePage);
    expect(samplePage?.body).toContain(
      "The MongoDB AI is an advanced LLM-based chatbot"
    );
  });
  it("processes metadata", () => {
    const samplePage = getSamplePage("mongodb-corp/chatbot/overview.md");
    expect(samplePage.metadata).toHaveProperty("foo", "bar");
    expect(samplePage.metadata).toHaveProperty("productName", "MongoDB Corp");
  });
  it("removes frontmatter from page body", () => {
    const samplePage = getSamplePage("mongodb-corp/chatbot/overview.md");
    expect(samplePage.body).not.toContain("---");
  });
  it("extracts title from frontmatter", () => {
    const samplePage = getSamplePage("mongodb-corp/chatbot/overview.md");
    expect(samplePage.title).toBeTruthy();
  });
  it("works with .mdx files", async () => {
    const dataSource = await makeMdOnGithubDataSource(testDataConfig);
    const pages = await dataSource.fetchPages();
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(
      pages.find((page) => page.url.includes("sampleMdxFile"))
    ).toBeTruthy();
  });
});
