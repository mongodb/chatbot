import { Document } from "langchain/document";
import { GithubRepoLoaderParams } from "langchain/document_loaders/web/github";
import { Page } from "chat-core";
import { DataSource } from "./DataSource";
import { makeGitDataSource } from "./GitDataSource";

export type MakeGitHubDataSourceArgs = {
  /**
    The data source name.
   */
  name: string;

  /**
    The GitHub repo URL.
   */
  repoUrl: string;

  /**
    The branch to fetch.
   */
  repoLoaderOptions?: Partial<GithubRepoLoaderParams>;

  /**
    Handle a given file in the repo.

    Any number of Pages can be returned for a given file. The exact details
    depend on the given repo.

    Return undefined to skip this document.

    Page sourceName will be overridden by the name passed to
    makeGitHubDataSource.
   */
  handleDocumentInRepo(
    document: Document<{ source: string }>
  ): Promise<undefined | Omit<Page, "sourceName"> | Omit<Page, "sourceName">[]>;
};

/**
  Loads an arbitrary GitHub repo and converts its contents into pages.
 */
export const makeGitHubDataSource = ({
  name,
  repoUrl,
  repoLoaderOptions,
  handleDocumentInRepo,
}: MakeGitHubDataSourceArgs): DataSource => {
  const repoOptions: Record<string, string | number> = {};
  const { branch, recursive } = repoLoaderOptions ?? {};
  if (branch) {
    repoOptions["--branch"] = branch;
  }
  if (recursive) {
    repoOptions["--recursive"] = `${recursive}`;
  }

  // Langchain GitHubRepoLoader consumes a lot of API requests and quickly hits
  // the limit. This is now using makeGitDataSource as a drop-in replacement.
  return makeGitDataSource({
    name,
    repoUri: repoUrl,
    repoOptions,
    async handlePage(path, pageContent) {
      return handleDocumentInRepo({ pageContent, metadata: { source: path } });
    },
    filter(path) {
      if (repoLoaderOptions === undefined) {
        return true;
      }
      const { ignorePaths, ignoreFiles } = repoLoaderOptions;
      for (const ignorePath of ignorePaths ?? []) {
        if (path === ignorePath) {
          return false;
        }
      }
      for (const ignoreFile of ignoreFiles ?? []) {
        if (typeof ignoreFile === "string") {
          if (path === ignoreFile) {
            return false;
          }
        } else if (ignoreFile.test(path)) {
          return false;
        }
      }
      return true;
    },
  });
};
