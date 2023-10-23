import { Embedder, PageStore, EmbeddedContentStore } from "chat-core";
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

    The ingest meta document is used by the `all` command to determine when the
    last successful run was for that ingestion.
   */
  ingestMetaStore: Constructor<IngestMetaStore>;

  /**
    The store that holds pages downloaded from data sources.
   */
  pageStore: Constructor<PageStore>;

  /**
    The store that holds the embedded content for later vector search.
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
};

export type Constructor<T> = (() => T) | (() => Promise<T>);
