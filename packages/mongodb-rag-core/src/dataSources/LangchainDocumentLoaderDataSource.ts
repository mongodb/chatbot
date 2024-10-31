import { DocumentLoader } from "langchain/document_loaders/base";
import { Document as LangchainDocument } from "langchain/document";
import { DataSource } from "./DataSource";
import { Page, PageMetadata } from "../contentStore";

export interface MakeLangChainDocumentLoaderDataSourceParams {
  /**
    [Langchain document loader](https://js.langchain.com/docs/modules/data_connection/document_loaders/) to use to load documents.
   */
  documentLoader: DocumentLoader;

  /**
    Name of the data source used by MongoDB RAG Ingest.
   */
  name: string;

  /**
    Metadata to use in the page metadata of all documents.

    `Page.metadata` generated with `transformLangchainDocumentToPage()`
    overrides this metadata if the properties have the same key.
   */
  metadata?: PageMetadata;

  /**
    Take the {@link LangchainDocument} returned by the `documentLoader`
    and transform it into the {@link Page} persisted in the {@link PageStore}.
   */
  transformLangchainDocumentToPage(
    doc: LangchainDocument
  ): Promise<Omit<Page, "sourceName">>;
}

/**
  Create a data source that loads pages from a [Langchain document loader](https://js.langchain.com/docs/modules/data_connection/document_loaders/).
 */
export function makeLangChainDocumentLoaderDataSource({
  documentLoader,
  name,
  metadata,
  transformLangchainDocumentToPage,
}: MakeLangChainDocumentLoaderDataSourceParams): DataSource {
  return {
    name,
    async fetchPages() {
      const documents = await documentLoader.load();
      const pages: Page[] = [];
      for (const d of documents) {
        const transformedPage = await transformLangchainDocumentToPage(d);
        pages.push({
          ...transformedPage,
          sourceName: name,
          metadata: {
            ...metadata,
            ...(transformedPage.metadata ?? {}),
          },
        });
      }
      return pages;
    },
  };
}
