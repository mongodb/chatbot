import { GithubRepoLoaderParams } from "@langchain/community/document_loaders/web/github";
import {
  MakeGitHubDataSourceArgs,
  makeGitHubDataSource,
} from "./GitHubDataSource";
import acquitTransform from "acquit-require";
import acquit from "acquit";
import { removeMarkdownImagesAndLinks } from "./removeMarkdownImagesAndLinks";
import { extractMarkdownH1 } from "./extractMarkdownH1";
import { logger } from "../logger";
import { PageMetadata, Page } from "../contentStore";

/**
  Loads an MD/Acquit docs site from a GitHub repo.
  [Acquit](https://www.npmjs.com/package/acquit) is a tool for writing tests in comments,
  and then extracting them into a test suite.
  This function loads the tests from the repo, and then transforms the document content
  to include tests from the test suite in the document.
  Acquit is used in the [Mongoose ODM](https://mongoosejs.com/docs) documentation.
  This data source assumes that the test files are in the same repo as the docs.
 */
export const makeAcquitRequireMdOnGithubDataSource = async ({
  name,
  repoUrl,
  repoLoaderOptions,
  pathToPageUrl,
  testFileLoaderOptions,
  metadata,
  acquitCodeBlockLanguageReplacement = "",
}: Omit<MakeGitHubDataSourceArgs, "handleDocumentInRepo"> & {
  /**
    Transform a filepath in the repo to a full URL for the corresponding Page object.
   */
  pathToPageUrl: (pathInRepo: string) => string;
  /**
    Options for the acquit test file loader.
   */
  testFileLoaderOptions: Partial<GithubRepoLoaderParams>;
  /**
    Arbitrary metadata to include in each Page object.
   */
  metadata?: PageMetadata;
  /**
   Replace the '```acquit\n' code blocks with '```${acquitCodeBlockReplacement}\n'
   If undefined, does not include a language, i.e '```\n'.
   */
  acquitCodeBlockLanguageReplacement?: string;
}) => {
  let testsPromise: Promise<string[]> | undefined;
  const getLazyLoadedTests = async () => {
    if (!testsPromise) {
      logger.info("Loading acquit tests from GitHub repo");
      testsPromise = getAcquitTestsFromGithubRepo(
        repoUrl,
        testFileLoaderOptions
      );
    }
    return testsPromise;
  };

  return makeGitHubDataSource({
    name,
    repoUrl,
    repoLoaderOptions: {
      ...(repoLoaderOptions ?? {}),
      ignoreFiles: [
        /^(?!.*\.md$).*/i, // Anything BUT the .md extension
        ...(repoLoaderOptions?.ignoreFiles ?? []),
      ],
    },
    async handleDocumentInRepo(document) {
      const tests = await getLazyLoadedTests();
      const { source } = document.metadata;
      const url = pathToPageUrl(source);
      const body = removeMarkdownImagesAndLinks(
        acquitTransform(document.pageContent, tests)
      ).replaceAll(
        "```acquit\n",
        `\`\`\`${acquitCodeBlockLanguageReplacement ?? ""}\n`
      );
      const page: Page = {
        body: body,
        format: "md",
        url,
        metadata,
        sourceName: name,
      };
      const h1 = extractMarkdownH1(page.body);
      if (h1) {
        page.title = h1;
      }
      return page;
    },
  });
};

export async function getAcquitTestsFromGithubRepo(
  repoUrl: string,
  repoLoaderOptions: Partial<GithubRepoLoaderParams>
) {
  const testFileSource = makeGitHubDataSource({
    name: "acquit-tests",
    repoUrl,
    repoLoaderOptions,
    async handleDocumentInRepo(document) {
      return {
        body: document.pageContent,
        url: document.metadata.source,
      } as Page;
    },
  });
  const pages = await testFileSource.fetchPages();
  const tests = pages
    .map(({ body, url }) => {
      try {
        return acquit.parse(body) as string;
      } catch (error) {
        logger.warn(
          `Error parsing acquit tests for file ${url}: ${
            (error as Error).message
          }`
        );
        return [];
      }
    })
    .flat();
  return tests;
}
