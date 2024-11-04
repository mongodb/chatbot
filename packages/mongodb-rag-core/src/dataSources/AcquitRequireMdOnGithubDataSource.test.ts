import { GithubRepoLoaderParams } from "@langchain/community/document_loaders/web/github";
import {
  getAcquitTestsFromGithubRepo,
  makeAcquitRequireMdOnGithubDataSource,
} from "./AcquitRequireMdOnGithubDataSource";
import "dotenv/config";
import { strict as assert } from "assert";

jest.setTimeout(90000);
const repoUrl = "https://github.com/Automattic/mongoose";
const testFileLoaderOptions: Partial<GithubRepoLoaderParams> = {
  branch: "master",
  unknown: "warn",
  recursive: true,
  ignoreFiles: [/^(?!\/test\/).+$/, /^(?!.*\.js$).+$/],
};
const repoLoaderOptions: Partial<GithubRepoLoaderParams> = {
  branch: "master",
  unknown: "warn",
  recursive: true,
  ignoreFiles: [/^(?!.*\.md$).*/i, /^(?!\/docs\/).+$/], // only load .md files in the /docs directory
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

    const convertedPage = mdPages.find((page) =>
      page.body.includes("```javascript\n")
    );
    assert(convertedPage);
    expect(convertedPage?.metadata).toBeDefined();
    expect(convertedPage?.metadata?.arbitrary).toBe("data");
    expect(convertedPage.url.endsWith(".html")).toBe(true);
    expect(convertedPage.title).toBeTruthy();
    expect(convertedPage.body).not.toContain("```acquit\n");
    expect(convertedPage.body).not.toMatch(/\[require:(.+?)\]/);
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
