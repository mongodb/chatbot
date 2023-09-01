import { snootyAstToMd } from "./snootyAstToMd";
import { rstToSnootyAst } from "./rstToSnootyAst";
import {
  MakeGitHubDataSourceArgs,
  makeGitHubDataSource,
} from "./GitHubDataSource";

/**
  Loads an rST docs site from a GitHub repo.
 */
export const makeRstOnGitHubDataSource = async ({
  name,
  repoUrl,
  repoLoaderOptions,
  pathToPageUrl,
}: Omit<MakeGitHubDataSourceArgs, "handleDocumentInRepo"> & {
  /**
    Transform a filepath in the repo to a full URL for the corresponding Page object.
   */
  pathToPageUrl: (pathInRepo: string) => string;
}) => {
  return makeGitHubDataSource({
    name,
    repoUrl,
    repoLoaderOptions: {
      ...(repoLoaderOptions ?? {}),
      ignoreFiles: [
        /^(?!.*\.rst$).*/i, // Anything BUT .rst extension
        ...(repoLoaderOptions?.ignoreFiles ?? []),
      ],
    },
    async handleDocumentInRepo(document) {
      const { source } = document.metadata;
      const url = pathToPageUrl(source);
      return {
        body: snootyAstToMd(rstToSnootyAst(document.pageContent)),
        format: "md",
        sourceName: name,
        url,
      };
    },
  });
};
