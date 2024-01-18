import { DocumentLoader } from "langchain/dist/document_loaders/base";
import { Document as LangchainDocument } from "langchain/document";
import { DataSource } from "./DataSource";
import { Page, PageFormat, PageMetadata } from "mongodb-rag-core";

export interface MakeLangChainDocumentLoaderDataSourceParams {
  /**
    [Langchain document loader](https://js.langchain.com/docs/modules/data_connection/document_loaders/) to use to load documents.
   */
  documentLoader: DocumentLoader;

  /**
    Name of the data source used by the MongoDB RAG Ingest.
   */
  name: string;

  /**
    Format of the pages being loaded.
   */
  format: PageFormat;

  /**
    Metadata to use in the page metadata of all documents
   */
  metadata?: PageMetadata;

  /**
    Get the URL of the page from the Langchain document.
   */
  getPageUrl: (doc: LangchainDocument) => string;

  /**
    Extract the title of the page from the Langchain document.
   */
  extractTitle: (doc: LangchainDocument) => Promise<string>;

  /**
    Transform the body of the Langchain document to use in the page body.
    For example, you might want to remove links from the page body.
   */
  transformPageBody?: (doc: LangchainDocument) => Promise<string>;
  /**
    Extract metadata from the Langchain document to use in the page metadata.
   */
  getMetadata?: (doc: LangchainDocument) => Promise<PageMetadata>;
}

/**
  Create a data source that loads pages from a [Langchain document loader](https://js.langchain.com/docs/modules/data_connection/document_loaders/).
 */
export function makeLangChainDocumentLoaderDataSource({
  documentLoader,
  name,
  metadata,
  getPageUrl,
  extractTitle,
  transformPageBody,
  format,
  getMetadata,
}: MakeLangChainDocumentLoaderDataSourceParams): DataSource {
  return {
    name,
    async fetchPages() {
      const documents = await documentLoader.load();
      const pages: Page[] = [];
      for (const d of documents) {
        pages.push({
          sourceName: name,
          url: getPageUrl(d),
          ...(extractTitle ? { title: await extractTitle(d) } : {}),
          format,
          body: transformPageBody ? await transformPageBody(d) : d.pageContent,
          // Add metadata if it exists
          ...(metadata || getMetadata
            ? {
                metadata: {
                  ...(metadata ?? {}),
                  ...(getMetadata ? await getMetadata(d) : {}),
                },
              }
            : {}),
        });
      }
      return pages;
    },
  };
}
