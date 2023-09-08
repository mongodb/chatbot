import {
  GithubRepoLoader,
  GithubRepoLoaderParams,
} from "langchain/document_loaders/web/github";
import {
  MakeGitHubDataSourceArgs,
  makeGitHubDataSource,
} from "./GitHubDataSource";
import transform from "acquit-require";
import acquit from "acquit";

/**
  Loads an MD/Acquit docs site from a GitHub repo.
 */
export const makeAcquitRequireOnGithubDataSource = async ({
  name,
  repoUrl,
  repoLoaderOptions,
  pathToPageUrl,
  testFileLoaderOptions,
}: Omit<MakeGitHubDataSourceArgs, "handleDocumentInRepo"> & {
  /**
    Transform a filepath in the repo to a full URL for the corresponding Page object.
   */
  pathToPageUrl: (pathInRepo: string) => string;
  testFileLoaderOptions: Partial<GithubRepoLoaderParams>;
}) => {
  const testFileLoader = new GithubRepoLoader(repoUrl, repoLoaderOptions);
  const testFiles = await testFileLoader.load();
  const testFilesSourceCode = testFiles.map((testFile) => testFile.pageContent);
  const tests = testFilesSourceCode
    .map((sourceCode) => acquit.parse(sourceCode))
    .flat();

  return makeGitHubDataSource({
    name,
    repoUrl,
    repoLoaderOptions: {
      ...(repoLoaderOptions ?? {}),
      ignoreFiles: [
        /^(?!.*\.(md|js)$).*/i, // Anything BUT .rst extension
        ...(repoLoaderOptions?.ignoreFiles ?? []),
      ],
    },
    async handleDocumentInRepo(document) {
      const { source } = document.metadata;
      const url = pathToPageUrl(source);
      return {
        body: transform(document.pageContent, tests),
        format: "md",
        sourceName: name,
        url,
      };
    },
  });
};
