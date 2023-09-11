import { GithubRepoLoaderParams } from "langchain/document_loaders/web/github";
import {
  getAcquitTestsFromGithubRepo,
  makeAcquitRequireMdOnGithubDataSource,
} from "./AcquitRequireMdOnGithubDataSource";
import "dotenv/config";
import { writeFileSync } from "fs";

jest.setTimeout(90000);
const repoUrl = "https://github.com/Automattic/mongoose";
const testFileLoaderOptions: Partial<GithubRepoLoaderParams> = {
  branch: "master",
  unknown: "warn",
  recursive: true,
  ignoreFiles: [/^(?!test\/).+$/],
};
const repoLoaderOptions: Partial<GithubRepoLoaderParams> = {
  branch: "master",
  unknown: "warn",
  recursive: true,
  ignoreFiles: [/^(?!.*\.md$).*/i, /^(?!docs\/).+$/], // only load .md files in the /docs directory
};
describe("AcquitRequireOnGithubDataSource", () => {
  it("should render a markdown file with code blocks from Acquit code blocks and markdown source", async () => {
    const acquitMdToStandardMdDataSource =
      await makeAcquitRequireMdOnGithubDataSource({
        repoUrl,
        repoLoaderOptions,
        name: "mongoose",
        pathToPageUrl(path) {
          return path
            .replace(/^docs\//, "https://mongoosejs.com/docs/")
            .replace(/\.md$/, ".html");
        },
        testFileLoaderOptions,
        acquitCodeBlockLanguageReplacement: "javascript",
        metadata: {
          arbitrary: "data",
        },
      });
    const mdPages = await acquitMdToStandardMdDataSource.fetchPages();
    expect(mdPages.length).toBeGreaterThan(0);
    const page = mdPages[0];
    writeFileSync("test.md", page.body);
    expect(page?.metadata?.arbitrary).toBe("data");
    expect(page.url.endsWith(".html")).toBe(true);
    expect(page.title).toBeTruthy();
  });
});

describe("getAcquitTestsFromGithubRepo()", () => {
  it("should return an array of acquit tests", async () => {
    const tests = await getAcquitTestsFromGithubRepo(
      repoUrl,
      testFileLoaderOptions
    );
    expect(tests.length).toBeGreaterThan(0);
  });
});
