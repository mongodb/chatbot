# Data Sources

You must configure which data sources you want to ingest data from.

## The `DataSource` Abstraction

The MongoDB RAG Ingest CLI includes a flexible abstraction, the [`DataSource`](../reference/core/modules/dataSources.md#datasource)
that allows you to ingest text data from a variety of sources.

Every data source must implement the `DataSource` type.
These data sources are then included in the `Config.dataSources` property.
Note that the `Config.dataSources` property is a function that returns an array.
This allows you to fetch `DataSource` instances dynamically.

```ts
export default {
  // ...rest of config
  dataSources: async () => [
    {
      name: "my-source",
      fetchPages: async () => {
        // ...fetch pages
      },
    },
    // ...other data sources
  ],
} satisfies Config;
```

## Data Source Helpers

While you have full flexibility to implement your own data sources,
the RAG framework provides helpers to make it easier to ingest data from common sources.

### Ingest with a Langchain `DocumentLoader`

To ingest any data that you can access with a Langchain.js [`DocumentLoader`](https://js.langchain.com/docs/integrations/document_loaders),
use the [`makeLangchainDocumentLoaderDataSource`](../reference/core/modules/dataSources.md#makelangchaindocumentloaderdatasource) function.

Here's an example implementation:

```ts
import { makeLangChainDocumentLoaderDataSource } from "mongodb-rag-core/dataSources";
import { TextLoader } from "langchain/document_loaders/fs/text";

// Langchain document loader
const documentLoader = new TextLoader(docPath);

const documentLoaderDataSource = makeLangChainDocumentLoaderDataSource({
  documentLoader,
  name: "some-source",
  metadata: {
    foo: "bar",
  },
  // This function transforms the Langchain document to a MongoDB Chatbot Framework `Page`
  transformLangchainDocumentToPage: async (doc) => ({
    format: "md",
    url: someFunctionToGetUrlFromDoc(doc),
    body: doc.pageContent,
    metadata: {
      fizz: "buzz",
    },
    title: someFunctionToGetTitleFromDoc(doc),
  }),
});
```

### Ingest from a Git Repository

To ingest data stored in a Git repository, use the [`makeGitDataSource()`](../reference/core/modules/dataSources.md#makegitdatasource) function.

Here's an example implementation:

```ts
import {
  makeGitDataSource,
  handleHtmlDocument,
} from "mongodb-rag-core/dataSources";

export const javaReactiveStreamsSourceConstructor = async () => {
  return await makeGitDataSource({
    name: "java-reactive-streams",
    repoUri: "https://github.com/mongodb/mongo-java-driver.git",
    repoOptions: {
      "--depth": 1,
      "--branch": "gh-pages",
    },
    metadata: {
      productName: "Java Reactive Streams Driver",
      version: jvmDriversVersion + " (current)",
      tags: ["docs", "driver", "java", "java-reactive-streams"],
    },
    filter: (path: string) =>
      path.endsWith(".html") &&
      path.includes(jvmDriversVersion) &&
      path.includes("driver-reactive") &&
      !path.includes("apidocs"),
    handlePage: async (path, content) =>
      await handleHtmlDocument(
        path,
        content,
        javaReactiveStreamsHtmlParserOptions
      ),
  });
};
```

### Ingest from MongoDB

We do not currently have a helper for ingesting data from a MongoDB database.
However, we do have a few implementations that you can use as a reference:

- [DevCenterDataSource](https://github.com/mongodb/chatbot/blob/main/ingest/src/sources/DevCenterDataSource.ts)
- [MongoDbDotComCustomersDataSource](https://github.com/mongodben/ingest-customers/blob/main/src/data-sources/MongoDbDotComCustomersDataSource.ts)

## Helper Functions

We have provided a few utility functions to help with common data ingestion tasks.

### Remove Markdown Images and Links

Generally, you want to strip out images and links when ingesting data.
The MongoDB RAG Ingest package includes the [`removeMarkdownImagesAndLinks()`](../reference/core/modules/dataSources.md#removemarkdownimagesandlinks)
function to make this easier for Markdown-formatted text.

You can import the `removeMarkdownImagesAndLinks()` function from the `mongodb-rag-ingest` package.

```ts
import { removeMarkdownImagesAndLinks } from "mongodb-rag-core";
```

To learn more about why you might want to strip out images and links,
refer to the [Clean up Text as You Ingest in the Optimization documentation](./optimize.md#clean-up-text-as-you-ingest).

### Convert HTML Documents to Markdown

Generally, you want to convert HTML documents to Markdown when ingesting data.
The MongoDB RAG Ingest package includes the [`handleHtmlDocument()`](../reference/core/modules/dataSources.md#handlehtmldocument) function to make this easier.
It helps you remove nodes from an HTML document, like the header and footer,
before converting the document to Markdown.

You can import the `handleHtmlDocument()` function from the `mongodb-rag-ingest` package.

```ts
import { handleHtmlDocument } from "mongodb-rag-core/dataSources";
```

You can see `handleHtmlDocument()` [used in the MongoDB Docs AI Chatbot configuration](https://github.com/mongodb/chatbot/blob/6ab06a24ae085d0db650bc4883ce1278728e3131/ingest-mongodb-public/src/sources.ts#L258).

To learn more about why you might want to convert HTML documents to Markdown,
refer to the [Standardize Data Formats in the Optimization documentation](./optimize.md#standardize-data-formats).

## Optimize Data Ingestion

For some suggestions on how you can optimize the data that you ingest
to best serve your chatbot, see the [Optimization documentation](./optimize.md).
