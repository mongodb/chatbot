import {
  MakeGitHubDataSourceArgs,
  makeGitHubDataSource,
} from "./GitHubDataSource";

/**
  Loads an .md docs site from a GitHub repo.
 */
export const makeMdOnGithubDataSource = async ({
  name,
  repoUrl,
  repoLoaderOptions,
  pathToPageUrl,
  metadata,
}: Omit<MakeGitHubDataSourceArgs, "handleDocumentInRepo"> & {
  /**
    Transform a filepath in the repo to a full URL for the corresponding Page object.
   */
  pathToPageUrl: (pathInRepo: string) => string;
  metadata: Record<string, unknown>; // TODO: bring in correct type
}) => {
  return makeGitHubDataSource({
    name,
    repoUrl,
    repoLoaderOptions: {
      ...(repoLoaderOptions ?? {}),
      ignoreFiles: [
        /^(?!.*\.md$).*/i, // Anything BUT .md extension
        ...(repoLoaderOptions?.ignoreFiles ?? []),
      ],
    },
    async handleDocumentInRepo(document) {
      const { source } = document.metadata;
      const url = pathToPageUrl(source);
      const title = ""; // TODO: get title
      return {
        // TODO: strip the links from the body w the util func when the acquire pr merged
        body: document.pageContent,
        format: "md",
        sourceName: name,
        url,
        title,
        metadata,
      };
    },
  });
};
