/**
  Loads markdown pages from URLs.
*/
import { DataSource, removeMarkdownImagesAndLinks } from ".";
import { extractMarkdownH1 } from "./extractMarkdownH1";
import { Page, PageMetadata } from "../contentStore";

export interface MakeMarkdownUrlDataSourceParams<
  SourceType extends string = string
> {
  /** Name of project */
  sourceName: string;

  /**
    List of URLs with markdown content to fetch. These do not need to end in `.md`, 
    they just need to point to a URL that is a markdown file.
    @example https://docs.voyageai.com/docs/quickstart-tutorial.md
   */
  markdownUrls: string[];

  /**
    Source type to be included in pages. 
   */
  sourceType?: SourceType;

  /**
    Metadata to be included in all pages.
   */
  metadata?: PageMetadata;

  /**
    Converts a markdown URL in markdownUrls into a Page URL.
   */
  markdownUrlToPageUrl?: (markdownUrl: string) => string;
}

export function makeMarkdownUrlDataSource<SourceType extends string = string>({
  sourceName,
  markdownUrls,
  sourceType,
  metadata,
  markdownUrlToPageUrl,
}: MakeMarkdownUrlDataSourceParams<SourceType>): DataSource {
  return {
    name: sourceName,
    async fetchPages() {
      const settledPages = await Promise.all(
        markdownUrls.map(async (url: string) => {
          if (!url.endsWith(".md") && !url.endsWith(".markdown")) {
            console.warn(`URL must end in .md or .markdown: ${url}`);
            return;
          }
          try {
            const response = await fetch(url);

            if (!response.ok) {
              console.warn(`${response.status} response from ${url}`);
            } else if (
              !(
                response.headers.get("content-type")?.includes("text/plain") ||
                response.headers.get("content-type")?.includes("text/markdown")
              )
            ) {
              console.warn(`Content is not markdown: ${url}`);
            } else {
              const body = removeMarkdownImagesAndLinks(await response.text());

              const page: Page<SourceType> = {
                url: markdownUrlToPageUrl ? markdownUrlToPageUrl(url) : url,
                title: extractMarkdownH1(body),
                format: "md",
                body,
                sourceName,
                sourceType,
                metadata,
              };
              return page;
            }
          } catch (error) {
            console.warn(`Failed to create page from ${url},`, error);
          }
        })
      );
      return settledPages.filter(
        (page): page is Page<SourceType> => page !== undefined
      );
    },
  };
}

export function removeDotMdFromUrl(url: string): string {
  if (url.endsWith(".md")) {
    return url.slice(0, -3);
  }
  return url;
}
