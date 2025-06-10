/**
  Loads markdown pages from URLs.
*/
import { DataSource, removeMarkdownImagesAndLinks } from "../dataSources";
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
    Takes precendence over the sourceType set in handlePage's Page constructor.
   */
  sourceType?: SourceType;

  /**
    Metadata to be included in all pages.
   */
  metadata?: PageMetadata;

  /**
    Converts a markdown URL in @param markdownUrls into a Page URL.
   */
  markdownUrlToPageUrl: (markdownUrl: string) => string;
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
      const pages: Page<SourceType>[] = [];
      markdownUrls.forEach(async (url: string) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const body = removeMarkdownImagesAndLinks(await response.text());

            const page: Page<SourceType> = {
              url: markdownUrlToPageUrl ? markdownUrlToPageUrl(url) : url,
              title: extractMarkdownH1(body) ?? "",
              format: "md",
              body,
              sourceName,
              sourceType,
              metadata,
            };
            pages.push(page);
          } else {
            throw new Error(
              `Failed fetch to ${url}, status ${response.status}`
            );
          }
        } catch (error) {
          console.error(`Failed to create page from ${url}`, error);
        }
      });
      return pages;
    },
  };
}

export function removeDotMdFromUrl(url: string): string {
  if (url.endsWith(".md")) {
    return url.slice(0, -3);
  }
  return url;
}
