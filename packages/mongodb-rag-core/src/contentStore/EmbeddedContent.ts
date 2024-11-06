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
    The vector embedding of the text.
   */
  embedding: number[];

  /**
    The date the content was last updated.
   */
  updated: Date;

  /**
    Arbitrary metadata associated with the content. If the content text has
    metadata in Front Matter format, this metadata should match that metadata.
   */
  metadata?: {
    pageTitle?: string;
    tags?: string[];
    [k: string]: unknown;
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

/**
  Data store of the embedded content.
 */
export type EmbeddedContentStore = VectorStore<EmbeddedContent> & {
  /**
    Load the embedded content for the given page.
   */
  loadEmbeddedContent(args: { page: Page }): Promise<EmbeddedContent[]>;

  /**
    Delete all embedded content for the given page.
   */
  deleteEmbeddedContent(args: { page: Page }): Promise<void>;

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
    Additional implementation-specific metadata about the store. This metadata is
    not directly used by the store itself, but may be useful for testing,
    debugging, and logging.
   */
  metadata?: {
    [k: string]: unknown;
  };
};
