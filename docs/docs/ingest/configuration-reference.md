# Configuration Reference

This page contains reference documentation for the configuration options for the MongoDB RAG Ingest CLI.

A Ingest CLI config files is a CommonJS file that exports a `Config` object as its default export.

For more information on setting up a configuration file, refer to the [Configure](./configure.md) documentation.

To set up a configuration file, you must first install the following packages:

```bash
npm install mongodb-rag-ingest mongodb-rag-core
```

## API Reference

For a full API reference of all modules exported by `mongodb-rag-ingest`
and `mongodb-rag-core`, refer to the [API Reference](../reference/) documentation.

This page links to the key reference documentation for configuring the Ingest CLI.

## `Config`

The [`Config`](../reference/ingest/modules.md#config) type is the root configuration type for the Ingest CLI.

## `IngestMetaStore`

The [`IngestMetaStore`](../reference/ingest/modules.md#ingestmetastore) is an interface to interact with MongoDB collection that tracks metadata associated with the ingest process.

To create an `IngestMetaStore`, you can use the function [`makeIngestMetaStore()`](../reference/ingest/modules.md#makeingestmetastore).
This function returns an `IngestMetaStore`.
This `IngestMetaStore` persists data in the `ingest_meta` collection in MongoDB.

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

The [`PageStore`](../reference/core/modules.md#pagestore) is an interface
to interact with [`Page`](../reference/core/modules.md#page) data.

To create a `PageStore` that uses MongoDB to store pages, you can use the function
[`makeMongoDbPageStore()`](../reference/core/modules.md#makemongodbpagestore).
This function returns a `PageStore`. This `PageStore` persists data in the `pages` collection in MongoDB.

To create an `PageStore` with `makeMongoDbPageStore()`:

```ts
import { makeMongoDbPageStore } from "mongodb-rag-core";

const pageStore = makeMongoDbPageStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});
```

## `EmbeddedContentStore`

The `EmbeddedContentStore` is an interface to the stored content and vector
embeddings used in your RAG app.

To create an `EmbeddedContentStore` that stores data in MongoDB,
you can use the function [`makeMongoDbEmbeddedContentStore()`](../reference/core/modules.md#makemongodbembeddedcontentstore).
This function returns an `EmbeddedContentStore`. This `EmbeddedContentStore` persists data in the `embedded_content` collection in MongoDB.

To create an `EmbeddedContentStore` with `makeMongoDbEmbeddedContentStore()`:

```ts
import { makeMongoDbEmbeddedContentStore } from "mongodb-rag-core";

const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  searchIndex: {
    embeddingName: OPENAI_EMBEDDING_MODEL,
  }
});
```

:::important[Set up Atlas Vector Search]

To use the `EmbeddedContentStore` returned by `makeMongoDbEmbeddedContentStore()` in your RAG app,
you must set up Atlas Vector Search on the `embedded_content` collection in MongoDB.
For more information on setting up the vector search index on the `embedded_content` collection,
refer to the [Create Atlas Vector Search Index](../mongodb.md#create-vector-search-index)
documentation.

:::

## `DataSource`

Add data sources for the Ingest CLI to pull content from.

Your [`DataSource`](../reference/core/modules/dataSources.md#datasource) implementations depend on where the content is coming from.
To learn more about creating a `DataSource`, refer to the [Data Sources](./data-sources.md) documentation.

## `Embedder`

The [`Embedder`](../reference/core/namespaces/Embed.md#embedder) takes in a string and returns a vector embedding for that string.

To create an `Embedder` that uses the LangChain `Embeddings` class,
you can use the function [`makeLangChainEmbedder()`](../reference/core/namespaces/Embed.md#makelangchainembedder). To see the various embedding models supported by LangChain, refer to the [LangChain text embedding models](https://js.langchain.com/docs/integrations/text_embedding) documentation.

```ts
import { makeLangChainEmbedder } from "mongodb-rag-core";
import { OpenAIEmbeddings } from "mongodb-rag-core/langchain";

const { OPENAI_API_KEY } = process.env;

const langChainOpenAiEmbeddings = new OpenAIEmbeddings({
  openAIApiKey: OPENAI_API_KEY,
  modelName: "text-embedding-3-large",
  dimensions: 1024,
});

const embedder = makeLangChainEmbedder({
  langChainEmbeddings: langChainOpenAiEmbeddings,
});
```

To create an `Embedder` that uses the [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings) directly,
you can use the function [`makeOpenAiEmbedder()`](../reference/core/namespaces/Embed.md#makeopenaiembedder). This function uses the
`openai` package to construct the OpenAI client, which supports
both the Azure OpenAI Service and the OpenAI API.

The `makeOpenAiEmbedder()` function also supports configuring exponential backoff
with the `backoffOptions` argument. This wraps the `exponential-backoff` package.
Exponential backoff behavior is included because when you are bulk uploading embeddings for content, you
may hit the rate limit for the OpenAI Embeddings API. This allows you to
automatically retry the embedding request after a delay.

Example usage:

```ts
import {
  makeOpenAiEmbedder,
  OpenAIClient,
  AzureKeyCredential,
} from "mongodb-rag-core";
import { AzureOpenAI } from "mongodb-rag-core/openai";

const { 
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_API_VERSION } = process.env;

const embedder = makeOpenAiEmbedder({
  openAiClient: new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  }),
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 25,
    startingDelay: 1000,
  },
});
```

## `ChunkOptions`

Use the [`ChunkOptions`](../reference/core/namespaces/Chunk.md#chunkoptions)
to configure how the Ingest CLI chunks content when converting `Page` documents
to `EmbeddedContent`.

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

For more information on optimizing the `ChunkOptions`, refer to [Refine the Chunking Strategy](./optimize.md#refine-the-chunking-strategy) in the Optimization documentation.
