import { Page, PageMetadata } from "../contentStore";
import {
  MakeGitHubDataSourceArgs,
  makeGitHubDataSource,
} from "./GitHubDataSource";
import { removeMarkdownImagesAndLinks } from "./removeMarkdownImagesAndLinks";
import { extractMarkdownH1 } from "./extractMarkdownH1";
import { extractFrontMatter } from "../frontMatter";

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

  filter?: MakeGitHubDataSourceArgs["filter"];

  /**
    Metadata to include with all Pages in DB.
   */
  metadata?: PageMetadata;

  /**
    Front matter configuration. Looks for metadata by default.
    @default
    { process: true, separator: "---", format: "yaml" }
   */
  frontMatter?: {
    /**
      Whether to process front matter. Defaults to `true`.
     */
    process: boolean;

    /**
      Separator character used by front matter. Usually "---" or "+++". Default is "---".
     */
    separator?: string;

    /**
      Front matter format. Usually "yaml" or "toml". Default is "yaml".
     */
    format?: string;
  };

  /**
    Extract metadata from page content and front matter (if it exists). Added to the `Page.metadata` field.
    If a key in the returned object from `extractMetadata()` is the same as a key in `metadata`,
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
  ) => string | undefined;
};
/**
  Loads an .md/.mdx docs site from a GitHub repo.
 */
export const makeMdOnGithubDataSource = async ({
  name,
  repoUrl,
  repoLoaderOptions,
  pathToPageUrl,
  filter,
  metadata,
  frontMatter = { process: true, separator: "---", format: "yaml" },
  extractMetadata,
  extractTitle = extractMarkdownH1,
}: MakeMdOnGithubDataSourceParams) => {
  return makeGitHubDataSource({
    name,
    repoUrl,
    filter,
    repoLoaderOptions: {
      ...(repoLoaderOptions ?? {}),
      ignoreFiles: [
        /^(?!.*\.(md|mdx)$).*/i, // Anything BUT .md OR .mdx extensions
        ...(repoLoaderOptions?.ignoreFiles ?? []),
      ],
    },
    async handleDocumentInRepo(document) {
      // Process front matter from markdown file into a Record<string, unknown>.
      // Remove front matter from body.
      let frontMatterMetadata: Record<string, unknown> | undefined;
      let body: string = document.pageContent;
      if (frontMatter.process) {
        const extracted = extractFrontMatter(
          document.pageContent,
          frontMatter.format,
          frontMatter.separator
        );
        frontMatterMetadata = extracted.metadata;
        body = extracted.body;
      }

      const { source } = document.metadata;
      // Extract metadata to use in page from page content and frontmatter (if it exists)
      let extractedMetadata: PageMetadata | undefined;
      try {
        extractedMetadata =
          extractMetadata && extractMetadata(body, frontMatterMetadata);
      } catch (err) {
        console.error(
          `The following error occurred when extracting  metadata from the page '${source}: ${JSON.stringify(
            err
          )}'`
        );
      }

      const url = pathToPageUrl(source, frontMatterMetadata);
      const page: Page = {
        body: removeMarkdownImagesAndLinks(body),
        format: "md",
        sourceName: name,
        url,
        metadata: { ...(metadata ?? {}), ...(extractedMetadata ?? {}) },
      };
      const title = extractTitle(document.pageContent, frontMatterMetadata);
      if (title) {
        page.title = title;
      }
      return page;
    },
  });
};
