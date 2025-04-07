# MongoDB & Atlas Vector Search

The MongoDB Chatbot Framework uses MongoDB Atlas as its data layer.

This page explains how to set up MongoDB Atlas and Atlas Vector Search for use with the MongoDB Chatbot Framework, and what is stored in all the collections.

## Set up

### 1. Create a MongoDB Atlas Cluster

To create a MongoDB Atlas cluster, follow the instructions in the [MongoDB Atlas documentation](https://mongodb.com/docs/atlas/getting-started/).

### 2. Create a MongoDB Database

By convention, we keep all data in the same MongoDB database.

However, you could theoretically use separate databases for collections, if you want to.

You can give the database any name you want.
You pass the name as a variable throughout the RAG framework.

### 3. Create an Atlas Vector Search Index (required for RAG) {#create-vector-search-index}

If you're using the Data Ingest CLI and Chatbot server
to perform retrieval augmented generation (RAG),
you must create an Atlas Vector Search index.

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

Documents in the `pages` collection follow the [`PersistedPage`](./reference/core/namespaces/ContentStore.md#persistedpage) schema.

### `embedded_content` Collection

The `embedded_content` collection holds the content that is queried by Atlas Vector Search.
It is generated with the ingest CLI `embed`commands from the data in the`pages` collection.

Documents in the `embedded_content` collection follow the [`EmbeddedContent`](./reference/core/interfaces/ContentStore.EmbeddedContent.md) schema.

### `ingest_meta` Collection

Stores metadata related to the ingest CLI. Currently, this a singleton collection
that stores one document related to the ingest CLI's `all` command.

Documents in the `ingest_meta` collection follow the [`IngestMetaEntry`](./reference/ingest/modules.md#ingestmetaentry) schema.

### `conversations` Collection

Stores user conversations with the chatbot from the chat server.

Documents in the `conversations` collection follow the [`Conversation`](./reference/core/namespaces/Conversations.md) schema.
