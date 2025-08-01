import { Page } from ".";
import { VectorStore } from "../VectorStore";

/**
  The embedded content of a chunk of text stored in the database.
 */
export interface EmbeddedContent {
  /**
    The URL of the page with the content.
   */
  url: string;

  /**
    The name of the data source the page was loaded from.
   */
  sourceName: string;

  /**
    The text represented by the vector embedding.
   */
  text: string;

  /**
    The number of embedding tokens in the content.
   */
  tokenCount: number;

  /**
    The vector embeddings of the text.
   */
  embeddings: {
    [k: string]: number[];
  };

  /**
    The date the content was last updated.
   */
  updated: Date;

  /**
    The source type indicates where the page was loaded from.
   */
  sourceType?: Page["sourceType"];

  /**
    Arbitrary metadata associated with the content. If the content text has
    metadata in Front Matter format, this metadata should match that metadata.
   */
  metadata?: {
    pageTitle?: string;
    tags?: string[];
    [k: string]: unknown;
    version?: {
      isCurrent: boolean;
      label: string;
    };
  };

  /**
    The order of the chunk if this content was chunked from a larger page.
   */
  chunkIndex?: number;

  /**
    Non-cryptographic hash of the actual chunking function (and its options)
    used to produce this chunk. Used to detect whether the chunk should be
    updated because the function or options have changed.
   */
  chunkAlgoHash?: string;
}

export type DeleteEmbeddedContentArgs = {
  /**
    The page for which to delete embedded content.
    */
  page?: Page;
  /**
    The names of the data sources for which to delete embedded content.
    */
  dataSources?: string[];
  /**
   If true, delete pages that do NOT match the data sources in the query.
   */
  inverseDataSources?: boolean;
};

export interface GetSourcesMatchParams {
  sourceNames?: string[];
  chunkAlgoHash: {
    hashValue: string;
    operation: "equals" | "notEquals";
  };
}

/**
  Filters for querying the embedded content vector store.
 */
export type QueryFilters = {
  url?: string;
  sourceName?: string | string[];
  version?: { current?: boolean; label?: string | string[] };
  sourceType?: Page["sourceType"] | string[];
};

/** 
  Metadata of data source
*/
export type DataSourceMetadata = {
  id: string;
  versions?: { label: string; isCurrent: boolean }[];
  type?: string;
};

/**
  Data store of the embedded content.
 */
export type EmbeddedContentStore = VectorStore<
  EmbeddedContent,
  QueryFilters
> & {
  /**
    Load the embedded content for the given page.
   */
  loadEmbeddedContent(args: { page: Page }): Promise<EmbeddedContent[]>;

  /**
    Delete all embedded content for the given page and/or data sources.
   */
  deleteEmbeddedContent(args: DeleteEmbeddedContentArgs): Promise<void>;

  /**
    Replace all embedded content for the given page with the given embedded content.
   */
  updateEmbeddedContent(args: {
    page: Page;
    embeddedContent: EmbeddedContent[];
  }): Promise<void>;

  /**
    Close connection to data store.
   */
  close?: () => Promise<void>;

  /**
    Additional implementation-specific metadata about the store.
   */
  metadata: {
    embeddingName: string;
    [k: string]: unknown;
  };

  /**
    Initialize the store.
   */
  init?: () => Promise<void>;

  /**
    Lists all unique data sources
   */
  listDataSources(): Promise<DataSourceMetadata[]>;

  /**
   Get the names of ingested data sources that match the given query. 
   */
  getDataSources(matchQuery: GetSourcesMatchParams): Promise<string[]>;
};
