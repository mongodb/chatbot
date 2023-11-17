# Configuration Reference

This page contains reference documentation for the configuration options for the MongoDB RAG Ingest CLI.

A Ingest CLI confi files is a CommonJS file that exports a `Config` object as its default export.

For more information on setting up a configuration file, refer to the [Configure](./configure.md) documentation.

To set up a configuration file, you must first install the following packages:

```bash
npm install mongodb-rag-ingest mongodb-rag-core
```

## `Config`

The `Config` type is the root configuration type for the Ingest CLI.

```ts
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
};

/**
 A constructor function that returns the instance of a type.
 All properties in the `Config` type are constructors.
 */
export type Constructor<T> = (() => T) | (() => Promise<T>);
```

## `IngestMetaStore`

The `IngestMetaStore` is an interface to interact with MongoDB collection that tracks metadata associated with the ingest process.

```ts
/**
  Interface to interact with MongoDB collection that tracks metadata associated with the ingest process.
*/
type IngestMetaStore = {
  /**
    The ID of the specific metadata document this store is associated with.
    Generally there should be only one document per ingest_meta collection per
    database.
   */
  readonly entryId: string;

  /**
    Returns the last successful run date for the store's entry.
   */
  loadLastSuccessfulRunDate(): Promise<Date | null>;

  /**
    Sets the store's entry to the current date.
   */
  updateLastSuccessfulRunDate(): Promise<void>;

  /**
    Closes the connection. Must be called when done.
   */
  close(): Promise<void>;
};
```

To create an `IngestMetaStore`, you can use the function `makeIngestMetaStore()`.
This function returns an `IngestMetaStore`. It takes the following arguments:

```ts
type MakeIngestMetaStoreParams = {
  connectionUri: string;
  databaseName: string;
  entryId: string;
};
```

To create an `IngestMetaStore` with `makeIngestMetaStore()`:

```ts
import { makeIngestMetaStore } from "mongodb-rag-ingest";

const ingestMetaStore = makeIngestMetaStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  entryId: "all",
});
```

## `PageStore`

The `PageStore` is an interface to interact with MongoDB collection `pages` that
stores the raw content of pages.

```ts
/**
  Data store for {@link Page} objects.
 */
export type PageStore = {
  /**
    Loads pages from the Page store.
   */
  loadPages(args?: {
    /**
      If specified, refines the query to load pages with an updated date later
      or equal to the given date.
     */
    updated?: Date;

    /**
      The names of the sources to load pages from. If undefined, loads available
      pages from all sources.
     */
    sources?: string[];
  }): Promise<PersistedPage[]>;

  /**
    Updates or adds the given pages in the store.
   */
  updatePages(pages: PersistedPage[]): Promise<void>;

  /**
    Close connection to data store.
   */
  close?: () => Promise<void>;
};
```

To create a `PageStore`, you can use the function `makeMongoDbPageStore()`.
This function returns a `PageStore`. It takes the following arguments:

```ts
export interface MakeMongoDbDatabaseConnectionParams {
  connectionUri: string;
  databaseName: string;
}
```

To create an `PageStore` with `makeMongoDbPageStore()`:

```ts
import { makeMongoDbPageStore } from "mongodb-rag-core";

const pageStore = makeMongoDbPageStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});
```

## `EmbeddedContentStore`

The `EmbeddedContentStore` is an interface to interact with MongoDB collection
`embedded_content` that stores the content and vector embeddings used in your RAG app.

:::important[Set up Atlas Vector Search]

To use the data in the `EmbeddedContentStore` in your RAG app,
you must set up Atlas Vector Search on the `embedded_content` collection in MongoDB.
For more information on setting up the vector search index on the `embedded_content` collection,
refer to the [Create Atlas Vector Search Index](../mongodb.md#3-create-atlas-vector-search-index)
documentation.

:::

```ts
/**
  Data store of the embedded content.
 */
export type EmbeddedContentStore = {
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
    Find nearest neighbors to the given vector.
   */
  findNearestNeighbors(
    vector: number[],
    options?: Partial<FindNearestNeighborsOptions>
  ): Promise<WithScore<EmbeddedContent>[]>;

  /**
    Close connection to data store.
   */
  close?: () => Promise<void>;
};
```

To create an `EmbeddedContentStore`, you can use the function `makeMongoDbEmbeddedContentStore()`.
This function returns an `EmbeddedContentStore`. It takes the following arguments:

```ts
export interface MakeMongoDbDatabaseConnectionParams {
  connectionUri: string;
  databaseName: string;
}
```

To create an `EmbeddedContentStore` with `makeMongoDbEmbeddedContentStore()`:

```ts
import { makeMongoDbEmbeddedContentStore } from "mongodb-rag-core";

const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});
```

## `DataSource`

Add data sources for the Ingest CLI to pull content from.

```ts
/**
  Represents a source of page data.
 */
export type DataSource = {
  /**
    The unique name among registered data sources.
   */
  name: string;

  /**
    Fetches pages in the data source.
   */
  fetchPages(): Promise<Page[]>;
};
```

Your `DataSource` implementations depend on where the content is coming from.
To learn more about creating a `DataSource`, refer to the [Data Sources](./data-sources.md) documentation.

## `Embedder`

The `Embedder` takes in a string and returns a vector embedding for that string.

```ts
type EmbedArgs = {
  /**
    The text to embed.
   */
  text: string;

  /**
    The user's IP address. Used to prevent abuse.
   */
  userIp: string;
};

type EmbedResult = {
  /**
    Vector embedding of the text.
   */
  embedding: number[];
};

/**
  Takes a string of text and returns an array of numbers representing the
  vector embedding of the text.
 */
type Embedder = {
  embed(args: EmbedArgs): Promise<EmbedResult>;
};
```

To create an `Embedder` that uses the [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings),
you can use the function `makeOpenAiEmbedder()`. This function uses the
`@azure/openai` package to construct the OpenAI client, which supports
both the Azure OpenAI Service and the Open API.

The `makeOpenAiEmbedder()` function also supports configuring exponential backoff
with the `backoffOptions` argument. This wraps the `exponential-backoff` package.
This is included because when you are bulk uploading embeddings for content, you
may hit the rate limit for the OpenAI Embeddings API. This allows you to
automatically retry the embedding request after a delay.

`makeOpenAiEmbedder()` takes the following arguments:

```ts
import { OpenAIClient } from "@azure/openai";
import { backOff, BackoffOptions } from "exponential-backoff";

export type MakeOpenAiEmbedderArgs = {
  /**
    Options used for automatic retry (usually due to rate limiting).
   */
  backoffOptions?: BackoffOptions;

  /**
    The deployment key.
   */
  deployment: string;

  /**
    The OpenAI client.
   */
  openAiClient: OpenAIClient;
};
```

Example usage:

```ts
import {
  makeOpenAiEmbedder,
  OpenAIClient,
  AzureKeyCredential,
} from "mongodb-rag-core";
const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_EMBEDDING_DEPLOYMENT } =
  process.env;

const embedder = makeOpenAiEmbedder({
  openAiClient: new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  ),
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 25,
    startingDelay: 1000,
  },
});
```

## `ChunkOptions`

`````ts
/**
  Options for converting a `Page` in the `pages collection into `EmbeddedContent`
  in the `embedded_content` collection.
 */
type ChunkOptions = {
  /**
    Minimum chunk size before transform function is applied to it.
    If a chunk has fewer tokens than this number, it is discarded  before ingestion.

    You can use this as a vector search optimization to avoid including chunks
    with very few tokens and thus very little semantic meaning.

    @example
    You might set this to `15` to avoid including chunks that are just a few characters or words.
    For instance, you likely would not want to set a chunk that is just the closing
    of a code block (```), which occurs not infrequently if chunking using the
    Langchain RecursiveCharacterTextSplitter.

    Chunk 1:
    ````text
    ```py
    foo = "bar"
    # more semantically relevant python code...
    ````

    Chunk 2:
    ````text
    ```
    ````
  */
  minChunkSize?: number;

  /**
    Maximum chunk size before transform function is applied to it.
    If Page has more tokens than this number, it is split into smaller chunks.
   */
  maxChunkSize: number;

  /**
    Number of tokens to overlap between chunks.
    If this is 0, chunks will not overlap.
    If this is greater than 0, chunks will overlap by this number of tokens.
   */
  chunkOverlap: number;

  /**
    Tokenizer to use to count number of tokens in text.
   */
  tokenizer: SomeTokenizer;

  /**
    If provided, this will override the maxChunkSize for openapi-yaml pages.
    This is useful because openapi-yaml pages tend to be very large, and
    we want to split them into smaller chunks than the default maxChunkSize.
   */
  yamlChunkSize?: number;

  /**
    Transform to be applied to each chunk as it is produced.
    Provides the opportunity to prepend metadata, etc.
   */
  transform?: ChunkTransformer;
};

type SomeTokenizer = {
  encode(text: string): {
    bpe: number[];
    text: string[];
  };
};

type ContentChunk = Omit<EmbeddedContent, "embedding" | "updated">;

type ChunkTransformer = (
  chunk: Omit<ContentChunk, "tokenCount">,
  details: {
    page: Page;
  }
) => Promise<Omit<ContentChunk, "tokenCount">>;
`````

By default, the Ingest CLI uses the following `ChunkOptions`.
These should work for many RAG apps.

```ts
import GPT3Tokenizer from "gpt3-tokenizer";

const defaultMdChunkOptions: ChunkOptions = {
  maxChunkSize: 600, // max chunk size of 600 tokens gets avg ~400 tokens/chunk
  minChunkSize: 15, // chunks below this size are discarded, which improves search quality
  chunkOverlap: 0,
  tokenizer: new GPT3Tokenizer({ type: "gpt3" }),
};
```
