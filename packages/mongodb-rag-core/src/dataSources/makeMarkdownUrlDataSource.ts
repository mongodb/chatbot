/**
  Loads markdown pages from URLs.
*/
import { DataSource, removeMarkdownImagesAndLinks } from "../dataSources";
import { extractMarkdownH1 } from "./extractMarkdownH1";
import { Page, PageMetadata } from "../contentStore";

export function makeMarkdownUrlDataSource<SourceType extends string = string>(
  name: string,
  markdownUrls: string[],
  sourceType: SourceType,
  staticMetadata: PageMetadata,
  markdownUrlToPageUrl?: (markdownUrl: string) => string
): DataSource {
  return {
    name,
    async fetchPages() {
      const pages: Page<SourceType>[] = [];
      markdownUrls.forEach(async (url: string) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const content = removeMarkdownImagesAndLinks(await response.text());

            const page: Page<SourceType> = {
              body: content,
              url: markdownUrlToPageUrl ? markdownUrlToPageUrl(url) : url,
              format: "md",
              sourceName: name,
              sourceType,
              title: extractMarkdownH1(content) ?? "",
              metadata: staticMetadata,
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
