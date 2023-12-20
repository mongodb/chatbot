# MongoDB & Atlas Vector Search

The MongoDB RAG framework uses MongoDB Atlas as its data layer.

This page explains how to set up MongoDB Atlas and Atlas Vector Search for use with the MongoDB RAG framework, and what is stored in all the collections.

## Set up

### 1. Create a MongoDB Atlas Cluster

To create a MongoDB Atlas cluster, follow the instructions in the [MongoDB Atlas documentation](https://mongodb.com/docs/atlas/getting-started/).

### 2. Create Database

By convention, we keep all data in the same MongoDB database.

However, you could theoretically use separate databases for collections, if you want to.

You can give the database any name you want.
You pass the name as a variable throughout the RAG framework.

### 3. Create Atlas Vector Search Index

In your database create a collection called `embedded_content`.

Then, create the following Atlas Vector Search index on the `embedded_content` collection:

```js
{
  "fields": [
    {
      // Whatever the dimensionality of your embeddings is
      "numDimensions": "<embedding length, e.g. 1536>",
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    },
    // Any fields you want to filter on
    // {
    //   "path": "sourceName",
    //   "type": "filter"
    // }
  ]
}
```

To learn how to create an Atlas Vector Search Index, refer to
[How to Index Vector Embeddings for Vector Search](https://www.mongodb.com/docs/atlas/atlas-search/field-types/knn-vector/)
in the MongoDB Atlas documentation.

### 4. Create Other Database Indexes (optional)

You don't need to create these indexes, to have a working application,
but they greatly improve data ingest performance.

On the `pages` collection:

```ts
{ sourceName: 1, url: 1 },
```

On the `embedded_content` collection:

```ts
// Note that the `embedding` field is indexed separately using Atlas Vector Search.
{ sourceName: 1, url: 1 },
```

For more information on how to create MongoDB indexes, refer to [Create an Index](https://www.mongodb.com/docs/manual/core/indexes/create-index/) in the MongoDB Server documentation.

## Database Schema

It has the following collections:

### `pages` Collection

The `pages` collection holds the plain text version of the content that is later chunked and embedded.

Document schema:

```ts
/**
  Represents a document stored in the `pages` collection.
 */
type Page = {
  _id: ObjectId;
  /**
    The URL of the page.
   */
  url: string;

  /**
    A human-readable title.
   */
  title?: string;

  /**
    The text of the page.
   */
  body: string;

  format: PageFormat;

  /**
    Data source name.
   */
  sourceName: string;

  /**
    Arbitrary metadata for page.
   */
  metadata?: PageMetadata;

  /**
    Last updated.
   */
  updated: Date;

  /**
    The action upon last update.
   */
  action: PageAction;
};

export type PageMetadata = {
  /**
    Arbitrary tags.
   */
  tags?: string[];
  [k: string]: unknown;
};

export type PageFormat = "md" | "txt" | "openapi-yaml";

export type PageAction = "created" | "updated" | "deleted";
```

### `embedded_content` Collection

The ``collection holds the content that is queried by Atlas Vector Search.
It is generated with the ingest CLI`embed`command from the data in the`pages` collection.

Document schema:

```ts
/**
  Represents a document stored in the `embedded_content` collection.
 */
type EmbeddedContent = {
  _id: ObjectId;
  /**
    The URL of the page where the content comes from.
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
  metadata?: { tags?: string[]; [k: string]: unknown };

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
};
```

### `ingest_meta` Collection

Stores metadata related to the ingest CLI. Currently, this a singleton collection
that stores one document related to the ingest CLI's `all` command.

Document schema:

```ts
/**
  Represents a document stored in the `ingest_meta` collection.
 */
type IngestMetaEntry = {
  _id: string;
  lastIngestDate: Date;
};
```

### `conversations` Collection

Stores user conversations with the chatbot from the chat server.

Document schema:

```ts
/**
  Represents a document stored in the `conversations` collection.
 */
export interface Conversation {
  _id: ObjectId;
  /** Messages in the conversation. */
  messages: Message[];
  /** The IP address of the user performing the conversation. */
  ipAddress: string;
  /** The date the conversation was created. */
  createdAt: Date;
  /** The hostname that the request originated from. */
  requestOrigin?: string;
}

export type Message = {
  /**
    Unique identifier for the message.
   */
  id: ObjectId;

  /**
    The role of the message in the conversation.
   */
  role: OpenAiMessageRole;

  /**
    Message that occurs in the conversation.
   */
  content: string;

  /**
    The date the message was created.
   */
  createdAt: Date;
};

export type SystemMessage = Message & {
  role: "system";
};

export type AssistantMessage = Message & {
  role: "assistant";

  /**
    Set to `true` if the user liked the response, `false` if the user didn't
    like the response. No value if user didn't rate the response. Note that only
    messages with `role: "assistant"` can be rated.
   */
  rating?: boolean;

  /**
    Further reading links for the message.
   */
  references: References;
};

export type UserMessage = Message & {
  role: "user";

  /**
    The preprocessed content of the message that is sent to vector search.
   */
  preprocessedContent?: string;

  /**
    Whether preprocessor suggested not to answer based on the input.
   */
  rejectQuery?: boolean;

  /**
    The vector representation of the message content.
   */
  embedding: number[];
};

/**
  Message in the {@link Conversation} as stored in the database.
 */
export type SomeMessage = UserMessage | AssistantMessage | SystemMessage;
```
