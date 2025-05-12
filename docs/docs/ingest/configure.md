# Configure the Ingest CLI

This guide explains how you can configure the MongoDB Ingest CLI to ingest
content into a MongoDB collection that you can use for retrieval augmented generation
(RAG) applications.

## Install the Ingest CLI

To install the Ingest CLI in a project, run the following command:

```bash
npm install mongodb-rag-ingest mongodb-rag-core
```

## Create a Configuration File

The MongoDB Ingest CLI uses a [CommonJS](https://en.wikipedia.org/wiki/CommonJS)
JavaScript configuration file to determine how to ingest content.

Every configuration file must export a [`Config`](../reference/ingest/modules.md#config) object as its default export.

You must either:

- Pass the path to a configuration file to every command with the `--config` flag.
- Put a CommonJS file named `ingest.config.js` in the root of your project.

For example, to run the `pages` command with a configuration file called `my-ingest.config.js`, run the following command:

```bash
ingest pages --config my-ingest.config.js --sourceName my-data-source
```

## Define Configuration Files with TypeScript

:::important[Use TypeScript Configuration Files!]

We **strongly** recommend using TypeScript configuration files.
The typing system helps you ensure that your configuration is valid.

:::

You can use TypeScript to make your configuration file. This allows you to use
the type system to ensure that your configuration is valid.

You must compile your configuration file to **CommmonJS** before running the CLI.
The CLI only accepts CommonJS configuration files.

You can build your CommonJS configuration file with `tsc`:

```bash
tsc --module commonjs --target es2017 --outDir dist ingest.config.ts
```

Then run the Ingest CLI with the compiled configuration file:

```bash
ingest pages update --config dist/ingest.config.js --sourceName my-data-source
```

## Example Configuration

Here's a simple example configuration file for the Ingest CLI.
You can use this configuration file as a starting point for your own configuration.

For simple RAG apps, the main thing you have to adjust is the `dataSources` property.
Use `dataSources` to add your own data.
For more information on configuring data sources, refer to the [Data Sources](./data-sources.md)
documentation.

Example configuration file:

```ts
// ingest.config.ts
import { makeIngestMetaStore, type Config } from "mongodb-rag-ingest";
import {
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
} from "mongodb-rag-core";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { standardChunkFrontMatterUpdater } from "mongodb-rag-core";
import { type DataSource } from "mongodb-rag-core";
const {
  MONGODB_DOT_COM_CONNECTION_URI,
  MONGODB_DOT_COM_DB_NAME,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_EMBEDDING_DEPLOYMENT,
} = process.env;

export default {
  embedder: () =>
    makeOpenAiEmbedder({
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
    }),
  embeddedContentStore: () =>
    makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
      searchIndex: {
        embeddingName: OPENAI_EMBEDDING_DEPLOYMENT,
      }
    }),
  pageStore: () =>
    makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    }),
  ingestMetaStore: () =>
    makeIngestMetaStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
      entryId: "all",
    }),
  chunkOptions: () => ({
    transform: standardChunkFrontMatterUpdater,
  }),
  dataSources: () => [
    // Add your own data sources here.
    {
      name: "my-data-source",
      async fetchPages() {
        const pages: Page[] = await getPagesFromSomeSource();
        return pages;
      },
    },
  ],
} satisfies Config;
```

## Configuration Reference

For complete reference documentation, refer to the [Configuration Reference](./configuration-reference.md) documentation.

## Additional Example Configurations

For additional example configurations, check out the following projects:

- [MongoDB documentation ingest](https://github.com/mongodb/chatbot/blob/main/packages/ingest-mongodb-public/src/config.ts): This is the most complex configuration. The ingest CLI was actually built for this project.
- [mongodb.com/customers ingest](https://github.com/mongodben/ingest-customers/blob/main/src/config.ts):
  Simple implementation with a single data source.
