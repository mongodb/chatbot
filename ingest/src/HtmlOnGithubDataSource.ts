import { Page, PageMetadata } from "chat-core";
import TurndownService from "turndown";

import {
  MakeGitHubDataSourceArgs,
  makeGitHubDataSource,
} from "./GitHubDataSource";

export type MakeMdOnGithubDataSourceParams = Omit<
  MakeGitHubDataSourceArgs,
  "handleDocumentInRepo"
> & {
  /**
    Transform a filepath in the repo to a full URL for the corresponding Page object.
   */
  pathToPageUrl: (
    pathInRepo: string,
    frontMatter?: Record<string, unknown>
  ) => string;
  /**
  Metadata to include with all Pages in DB.
   */
  metadata?: PageMetadata;

  /**
    Extract metadata from page content and front matter (if it exists). Added to the `Page.metadata` field.
    If a in the result of `extractMetadata()` is the same as a key in `metadata`,
    the `extractMetadata()` key will override it.
   */
  extractMetadata?: (
    pageContent: string,
    frontMatter?: Record<string, unknown>
  ) => PageMetadata;
  /**
    Extract title from page content and front matter (if it exists). Added to the `Page.title` field.
    If not specified, the first Markdown H1 (e.g. "# Some Title") in the page content will be used.
   */
  extractTitle?: (
    pageContent: string,
    frontMatter?: Record<string, unknown>
  ) => string | null;
};
/**
  Loads an .md docs site from a GitHub repo.
 */
export const makeMdOnGithubDataSource = async ({
  name,
  repoUrl,
  repoLoaderOptions,
  pathToPageUrl,
  metadata,
  extractMetadata,
  extractTitle,
}: MakeMdOnGithubDataSourceParams) => {
  const turndownService = new TurndownService(); // TODO: do stuff with this
  // TODO: do stuff with JSDom to mutate and search HTML's dom
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
    async handleDocumentInRepo(document) {},
  });
};
