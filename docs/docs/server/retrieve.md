# Retrieve Context Information

If you're using the MongoDB Chatbot Server to perform RAG, you must retrieve
context information to include in your answer. The primary way of doing this
is with semantic search.

## `FindContentFunc`

To perform semantic search, you must implement a [`FindContentFunc`](../reference/server/modules.md#findcontentfunc) function. To see the default implementation
using Atlas Vector Search, refer to the following
[Configure Atlas Vector Search](#configure-atlas-vector-search) section.

Pass the `FindContentFunc` to the [`ConversationsRouterParams.findContent`](../reference/server/interfaces/ConversationsRouterParams.md#findcontent) property.

```ts
import { FindContentFunc } from "mongodb-chatbot-server";
import { someFindContentFunc } from "./someFindContentFunc"; // example

const appConfig: AppConfig = {
  // ...other config
  conversationsRouterParams: {
    findContent: someFindContentFunc,
    // ...other config
  },
};
```

## Configure Atlas Vector Search

To use the MongoDB Chatbot Server with Atlas Vector Search for semantic search,
you can use the [`makeDefaultFindContentFunc()`](../reference/server/modules.md#makedefaultfindcontentfunc).

Pass a [`MakeDefaultFindContentFuncArgs`](../reference/server/modules.md#makedefaultfindcontentfuncargs) object to the `makeDefaultFindContentFunc()` function.

```ts
import {
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedder,
  AppConfig,
  makeDefaultFindContentFunc,
  MakeDefaultFindContentFuncArgs,
} from "mongodb-chatbot-server";

// Create function that creates vector embeddings
// for user query.
const embedder = makeOpenAiEmbedder({
  openAiClient,
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});

// Data store that is used to store the vector embeddings.
// Used to look up matching content.
const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

const args: MakeDefaultFindContentFuncArgs = {
  embedder,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  },
};
const findContent = makeDefaultFindContentFunc(args);

const appConfig: AppConfig = {
  // ...other config
  conversationsRouterParams: {
    findContent,
    // ...other config
  },
};
```

### Boost Results

You can modify the results returned by the default find content function with
[`SearchBooster`](../reference/server/interfaces/SearchBooster.md) objects.
`SearchBooster`s mutate the results returned by the default find content function.

You could use a `SearchBooster` to do things like:

- Always results from a specific data source
- Ensure a data source isn't over-represented in the results

To use one or more `SearchBooster`s, pass them to the `MakeDefaultFindContentFuncArgs.searchBoosters` property. The `searchBoosters` property is an array of `SearchBooster` objects, which are applied in the order of the array.

The following is an example of using a `SearchBooster` to ensure that results from a specific data source are always returned.

```ts
/**
 * Ensure that results from data source 'foo' are always returned
 * if query contains 'foo'.
 */
const boostFoo: SearchBooster = {
  async shouldBoostFunc({ text }: { text: string }) {
    return text.includes("foo");
  },
  async boost({
    embedding,
    store,
    existingResults,
  }: {
    embedding: number[];
    store: EmbeddedContentStore;
    existingResults: WithScore<EmbeddedContent>[];
  }) {
    const boostedResults = await store.findNearestNeighbors(
      embedding,
      {
        k: 2,
        path: "embedding",
        indexName: VECTOR_SEARCH_INDEX_NAME,
        minScore: 0, // no min score for 'foo'
      },
      {
        filter: {
          dataSource: "foo",
        },
      }
    );
    const fewerExistingResults = existingResults.slice(0, 3);
    // No duplicates
    const newResults = fewerExistingResults.filter((result) =>
      boostedResults.every((manualResult) => manualResult.text !== result.text)
    );
    //
    return [...boostedResults, ...fewerExistingResults].sort(
      (a, b) => b.score - a.score
    );
  },
};

const args: MakeDefaultFindContentFuncArgs = {
  // ...other args
  searchBoosters: [boostFoo],
};
```
