import pdf2md from "@opendocsg/pdf2md";
import { Page, PageMetadata } from "../contentStore";
import { DataSource } from "./DataSource";
import { extractMarkdownH1 } from "./extractMarkdownH1";

export type GetPdfBufferFunc = (url: string) => Buffer[];

export type GetTitleFromPdfFunc = (pdfMdContent: string) => string | undefined;

export type MakePdfToMarkdownDataSourceArgs<
  SourceType extends string = string
> = {
  /**
    The data source name.
  */
  name: string;

  /**
    The page URLs of the PDFs.
  */
  urls: string[];

  /**
    Gets Buffer object for a PDF.
  */
  getPdfBuffer: GetPdfBufferFunc;

  /**
    Converts the raw URL to a Page URL. 
    TODO - We should use this to normalize the URL after EAI-1029 (#825) is merged.
  */
  transformPageUrl?: (url: string) => string;

  /**
    Gets title from the parsed PDF markdown contents.
  */
  getTitleFromContent?: GetTitleFromPdfFunc;

  /**
    Source type to be included in pages.
  */
  sourceType?: SourceType;

  /**
    Metadata to be included in all pages.
  */
  metadata?: PageMetadata;
};

/** Loads PDF and converts content to Page */
export function makePdfToMarkdownDataSource<
  SourceType extends string = string
>({
  name,
  urls,
  getPdfBuffer,
  transformPageUrl = (url) => url,
  getTitleFromContent = extractMarkdownH1,
  sourceType,
  metadata,
}: MakePdfToMarkdownDataSourceArgs<SourceType>): DataSource {
  return {
    name,
    fetchPages: async () => {
      const pages: (Page<SourceType> | undefined)[] = await Promise.all(
        urls.map(async (url) => {
          try {
            const buffer = getPdfBuffer(url);
            const mdContent = await pdf2md(buffer);
            const page: Page<SourceType> = {
              url: transformPageUrl(url),
              title: getTitleFromContent(mdContent) ?? url,
              body: mdContent,
              format: "md",
              sourceName: name,
              sourceType,
              metadata,
            };
            return page;
          } catch (error) {
            console.warn(`Failed to create PDF page for url '${url}',`, error);
          }
        })
      );
      return pages.filter(
        (page): page is Page<SourceType> => page !== undefined
      );
    },
  };
}
