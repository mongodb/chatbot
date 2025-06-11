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
    Converts a markdown URL in @param markdownUrls into a Page URL.
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
    async fetchPages(): Promise<Page<SourceType>[]> {
      const settledPages = await Promise.all(
        markdownUrls.map(async (url: string) => {
          try {
            if (!url.endsWith(".md") && !url.endsWith(".markdown")) {
              throw new Error("URL must end in .md or .markdown");
            }

            const response = await fetch(url);

            if (!response.ok) {
              throw new Error(`${response.status} response from ${url}`);
            } else if (
              !(
                response.headers.get("content-type")?.includes("text/plain") ||
                response.headers.get("content-type")?.includes("text/markdown")
              )
            ) {
              throw new Error(`Content is not markdown: ${url}`);
            } else {
              const body = removeMarkdownImagesAndLinks(await response.text());

              const page: Page<SourceType> = {
                url: markdownUrlToPageUrl ? markdownUrlToPageUrl(url) : url,
                title: extractMarkdownH1(body), // TODO What if the body is empty? Or if there is no H1?
                format: "md",
                body,
                sourceName,
                sourceType,
                metadata,
              };
              return page;
            }
          } catch (error) {
            console.error(`Failed to create page from ${url},`, error);
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
