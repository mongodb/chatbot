import { Page, PageMetadata, pageFormat } from "../contentStore";
import {
  MakeGitHubDataSourceArgs,
  makeGitHubDataSource,
} from "./GitHubDataSource";
import path from "path";

export type MakeCodeOnGithubTextDataSourceParams =
  // MakeGitHubDataSourceArgs & {
  Omit<MakeGitHubDataSourceArgs, "handleDocumentInRepo"> & {
    /**
    Metadata to include with all Pages in DB.
   */
    metadata?: PageMetadata;
  };

/**
  Loads source code files from a GitHub repo.
 */
export const makeCodeOnGithubTextDataSource = async ({
  name,
  repoUrl,
  repoLoaderOptions,
  filter,
  metadata,
}: MakeCodeOnGithubTextDataSourceParams) => {
  return makeGitHubDataSource({
    name,
    repoUrl,
    filter,
    repoLoaderOptions: {
      ...(repoLoaderOptions ?? {}),
      ignoreFiles: [
        /LICENSE/,
        /CONTRIBUTING/,
        /\.git/, // Ignores .git/, .gitignore, .github/, etc.
        /\.dockerignore/,
        /\.gcloudignore/,
        /\.editorconfig/,
        /\.vscode/,
        ...(repoLoaderOptions?.ignoreFiles ?? []),
      ],
    },
    async handleDocumentInRepo(document) {
      const format = pageFormat(getFileExtension(document.metadata.source));
      const page: Page = {
        body: document.pageContent,
        format,
        sourceName: name,
        url: pageBlobUrl({
          repoUrl,
          branch: repoLoaderOptions?.branch ?? "master",
          filePath: document.metadata.source,
        }),
        metadata: {
          ...(metadata ?? {}),
          programmingLanguage: format,
        },
      };
      return page;
    },
  });
};

function getFileExtension(filePath: string) {
  // Use regular expression to extract file extension
  const match = filePath.match(/\.([^.]+)$/);
  // If a match is found, return the extension; otherwise, default to "txt"
  return match ? match[1] : "txt";
}

export function pageBlobUrl(args: {
  repoUrl: string;
  branch: string;
  filePath?: string | string[];
}) {
  const { origin, pathname: repoUrlPath } = new URL(args.repoUrl);
  const urlPath = path.posix.join(
    repoUrlPath,
    "blob",
    args.branch,
    ...(args.filePath === undefined
      ? [""]
      : Array.isArray(args.filePath)
      ? args.filePath
      : [args.filePath])
  );
  return new URL(urlPath, origin).toString();
}
