import { Document } from "langchain/document";
import {
  GithubRepoLoader,
  GithubRepoLoaderParams,
} from "langchain/document_loaders/web/github";
import { Page, logger } from "chat-core";
import { DataSource } from "./DataSource";

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
      const promises = documents.map(
        async (document): Promise<Page[] | undefined> => {
          try {
            // GitHub loader should put source (filepath) in the metadata
            if (document.metadata.source === undefined) {
              throw new Error(
                "missing 'source' property in GithubRepoLoader document metadata"
              );
            }
            const pageOrPages = await handleDocumentInRepo(document);
            if (pageOrPages === undefined) {
              return undefined;
            }
            const pages = Array.isArray(pageOrPages)
              ? pageOrPages
              : [pageOrPages];
            return pages.map(
              (page): Page => ({
                ...page,
                sourceName: name,
              })
            );
          } catch (error) {
            // Log the error and discard this document, but don't break the
            // overall fetchPages() call.
            logger.error(error);
            return undefined;
          }
        }
      );
      return (
        (await Promise.allSettled(promises)).filter(
          (promiseResult) => promiseResult.status === "fulfilled"
        ) as PromiseFulfilledResult<Page[] | undefined>[]
      )
        .map(({ value }) => value)
        .flat(1)
        .filter((v) => v !== undefined) as Page[];
    },
  };
};
