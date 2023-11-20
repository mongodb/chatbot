# Data Sources

You must configure which data sources you want to ingest data from.
We have created a flexible abstraction layer, the `DataSource` that allows you
to ingest text data from a variety of sources.

## The `DataSource` Abstraction

Every data source must implement the below `DataSource` type.

```ts
/**
  Represents a source of page data.
 */
type DataSource = {
  /**
    The unique name among registered data sources.
    It is the `name` is used in the CLI to specify which data source to use,
    such as `ingest pages --sourceName= my-source`.
    @example "my-source"
   */
  name: string;

  /**
    Fetches pages in the data source. These pages are added
    to the `pages` collection in MongoDB.
   */
  fetchPages(): Promise<Page[]>;
};

/**
  Represents a page from a DataStore.
 */
type Page = {
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
};

type PageMetadata = {
  /**
    Arbitrary tags.
   */
  tags?: string[];
  [k: string]: unknown;
};

type PageFormat = "md" | "txt" | "openapi-yaml";

type PageAction = "created" | "updated" | "deleted";
```

These data sources are then included in the `Config.dataSources` property.

Note that the `Config.dataSources` property is a function that returns an array.
This allows you to perform asynchronous operations to fetch `DataSource`s.

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
we have provided a few helpers to make it easier to ingest data from common sources.

### Ingest from a Git Repository

To ingest data stored in a Git repository, use the `makeGitDataSource()` function.

Here's an example implementation:

```ts
import {
  makeGitDataSource,
  handleHtmlDocument,
} from "mongodb-rag-ingest/sources";
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

We do not currently have a helper for ingesting data from MongoDB.
However, we do have a few implementations that you can use as a reference:

- [DevCenterDataSource](https://github.com/mongodb/chatbot/blob/main/ingest/src/sources/DevCenterDataSource.ts)
- [MongoDbDotComCustomersDataSource](https://github.com/mongodben/ingest-customers/blob/main/src/data-sources/MongoDbDotComCustomersDataSource.ts)

## Helper Functions

We have provided a few helper functions to make it easier to ingest data from common sources.

### Remove Markdown Images and Links

Generally, you want to strip out images and links when ingesting data.
We created the `removeMarkdownImagesAndLinks()` function to make this easier
for Markdown-formatted text.

You can import the `removeMarkdownImagesAndLinks()` function from the `mongodb-rag-ingest` package.

```ts
import { removeMarkdownImagesAndLinks } from "mongodb-rag-ingest/sources";
```

To learn more about why you might want to strip out images and links,
refer to the [Clean up Text as You Ingest in the Fine Tuning documentation](./fine-tune.md#clean-up-text-as-you-ingest).

### Convert HTML Documents to Markdown

Generally, you want to convert HTML documents to Markdown when ingesting data.
We created the `handleHtmlDocument()` function to make this easier.
It helps you remove nodes from an HTML document, like the header and footer,
before converting the document to Markdown.

You can import the `handleHtmlDocument()` function from the `mongodb-rag-ingest` package.

```ts
import { handleHtmlDocument } from "mongodb-rag-ingest/sources";
```

You can see `handleHtmlDocument()` [used in the MongoDB Docs AI Chatbot configuration](https://github.com/mongodb/chatbot/blob/6ab06a24ae085d0db650bc4883ce1278728e3131/ingest-mongodb-public/src/sources.ts#L258).

To learn more about why you might want to convert HTML documents to Markdown,
refer to the [Standardize Data Formats in the Fine Tuning documentation](./fine-tune.md#standardize-data-formats).

## Optimize Data Ingestion

For some suggestions on how you can optimize the data that you ingest
to best serve your chatbot, see the [Fine Tuning documentation](./fine-tune.md).
