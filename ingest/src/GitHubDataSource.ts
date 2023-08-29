import { Page } from "chat-core";
import { DataSource } from "./DataSource";
import { Document } from "langchain/document";
import {
  GithubRepoLoader,
  GithubRepoLoaderParams,
} from "langchain/document_loaders/web/github";

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
    Handle a given file in the repo. Any number of Pages can be returned for a
    given file. The exact details depend on the given repo.
   */
  handleDocumentInRepo(
    document: Document<{ source: string }>
  ): Promise<void | Page | Page[]>;
};

/**
  Loads an arbitrary GitHub repo and converts its contents into pages.
 */
export const makeGitHubDataSource = async ({
  name,
  repoUrl,
  repoLoaderOptions,
  handleDocumentInRepo,
}: MakeGitHubDataSourceArgs): Promise<DataSource> => {
  const loader = new GithubRepoLoader(repoUrl, repoLoaderOptions);
  return {
    name,
    async fetchPages() {
      const documents = (await loader.load()) as Document<{ source: string }>[];
      return (
        await Promise.all(
          documents.map(async (document) => {
            // GitHub loader should put source (filepath) in the metadata
            if (document.metadata.source === undefined) {
              throw new Error(
                "missing 'source' property in GithubRepoLoader document metadata"
              );
            }
            return await handleDocumentInRepo(document);
          })
        )
      )
        .flat(1)
        .filter((v) => v !== undefined) as Page[];
    },
  };
};

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
        body: document.pageContent,
        format: "rst",
        sourceName: name,
        url,
      };
    },
  });
};
