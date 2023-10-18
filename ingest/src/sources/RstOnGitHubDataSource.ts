import { Document } from "langchain/document";
import { rstToSnootyAst } from "./snooty/rstToSnootyAst";
import { snootyAstToMd } from "./snooty/snootyAstToMd";
import {
  MakeGitHubDataSourceArgs,
  makeGitHubDataSource,
} from "./GitHubDataSource";
import { extractMarkdownH1 } from "./extractMarkdownH1";

/**
  Loads an rST docs site from a GitHub repo.
 */
export const makeRstOnGitHubDataSource = async <
  MetadataType extends Record<string, unknown>
>({
  name,
  repoUrl,
  repoLoaderOptions,
  pathToPageUrl,
  getMetadata,
}: Omit<MakeGitHubDataSourceArgs, "handleDocumentInRepo"> & {
  /**
    Transform a filepath in the repo to a full URL for the corresponding Page object.
   */
  pathToPageUrl(pathInRepo: string): string;

  /**
    Return arbitrary metadata for the given document.
   */
  getMetadata?(info: {
    document: Document<{ source: string }>;
    url: string;
    bodyMarkdown: string;
    title?: string;
  }): MetadataType | undefined;
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

      const body = snootyAstToMd(rstToSnootyAst(document.pageContent));

      const title = extractMarkdownH1(body);

      const metadata = getMetadata
        ? getMetadata({ document, url, bodyMarkdown: body, title })
        : undefined;

      return {
        body,
        format: "md",
        sourceName: name,
        url,
        metadata,
        title,
      };
    },
  });
};
