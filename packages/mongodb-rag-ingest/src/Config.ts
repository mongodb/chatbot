import { Embedder, PageStore, EmbeddedContentStore } from "mongodb-rag-core";
import { DataSource } from "./sources/DataSource";
import { ChunkOptions } from "./embed/chunkPage";
import { IngestMetaStore } from "./IngestMetaStore";

/**
  The configuration for ingest.

  You can provide your own configuration to the ingest tool.

  Every property is a function that constructs an instance (synchronously or
  asynchronously). This allows you to run logic for construction or build async.
  It also avoids unnecessary construction and cleanup if that field of the
  config is overridden by a subsequent config.
 */
export type Config = {
  /**
    The store that contains the ingest meta document.

    The ingest meta document stores the date of the last successful run.
   */
  ingestMetaStore: Constructor<IngestMetaStore>;

  /**
    The store that holds pages downloaded from data sources.
   */
  pageStore: Constructor<PageStore>;

  /**
    The store that holds the embedded content and vector embeddings for later vector search.
   */
  embeddedContentStore: Constructor<EmbeddedContentStore>;

  /**
    The data sources that you want ingest to pull content from.
   */
  dataSources: Constructor<DataSource[]>;

  /**
    The embedding function.
   */
  embedder: Constructor<Embedder>;

  /**
    Options for the chunker.
   */
  chunkOptions?: Constructor<Partial<ChunkOptions>>;

  /**
    Options for concurrency.
   */
  concurrencyOptions?: Constructor<ConcurrencyOptions>;
};


  /**
    Options for concurrency. 
    Set the number of tasks to process concurrently in the promise pool.
    If not specified, tasks will be run sequentially.
   */
export interface ConcurrencyOptions {
  /**
    Options for concurrency when embedding content. Set the number of tasks to process concurrently.
   */
  embed?: {
    processPages: number,
    createChunks: number,
  },
  /**
    Options for concurrency for pages. Set the number of tasks to process concurrently.
   */
  pages?: {
    processDataSources: number,
  }
}


export type Constructor<T> = (() => T) | (() => Promise<T>);
