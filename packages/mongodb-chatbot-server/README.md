# MongoDB Chatbot Server

Chatbot server for the MongoDB Chatbot Framework.

The `mongodb-chatbot-server` is a npm package that provides a configurable Express.js server
to quickly spin up a retrieval augmented generation (RAG) chatbot server powered by MongoDB.

The server is designed to handle the generalizable areas of a RAG server,
like routing, caching, logging, and streaming. This allows you to focus on the
specifics of your chatbot, like the content, prompts, and AI models.

## Documentation

To learn more about the MongoDB Chatbot Server, check out the [documentation](https://mongodb.github.io/chatbot/server/configure/).

## Usage

### Installation

Install the package using `npm`:

```sh
npm install mongodb-chatbot-server
```

### Configuration

The `mongodb-chatbot-server` exports the function `makeApp()` which exports the
Express.js app. The function takes a `AppConfig` object as an argument.

Here's an example configuration and server:

```ts
import "dotenv/config";
import {
  MongoClient,
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedFunc,
  makeMongoDbConversationsService,
  makeDataStreamer,
  AppConfig,
  makeOpenAiChatLlm,
  OpenAiChatMessage,
  SystemPrompt,
  makeDefaultFindContentFunc,
  logger,
  makeApp,
} from "mongodb-chatbot-server";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";

export const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = process.env;

export const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);
export const systemPrompt: SystemPrompt = {
  role: "system",
  content: `You are expert MongoDB documentation chatbot.
  Respond in the style of a pirate. End all answers saying "Ahoy matey!!"
  Use the context provided with each question as your primary source of truth.
  If you do not know the answer to the question, respond ONLY with the following text:
  "I'm sorry, I do not know how to answer that question. Please try to rephrase your query. You can also refer to the further reading to see if it helps."
  NEVER include links in your answer.
  Format your responses using Markdown.
  DO NOT mention that your response is formatted in Markdown.
  Never mention "<Information>" or "<Question>" in your answer.
  Refer to the information given to you as "my knowledge".`,
};

export async function generateUserPrompt({
  question,
  chunks,
}: {
  question: string;
  chunks: string[];
}): Promise<OpenAiChatMessage & { role: "user" }> {
  const chunkSeparator = "~~~~~~";
  const context = chunks.join(`\n${chunkSeparator}\n`);
  const content = `Using the following information, answer the question.
  Different pieces of information are separated by "${chunkSeparator}".

  <Information>
  ${context}
  <End information>

  <Question>
  ${question}
  <End Question>`;
  return { role: "user", content };
}

export const llm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  systemPrompt,
  openAiLmmConfigOptions: {
    temperature: 0,
    maxTokens: 500,
  },
  generateUserPrompt,
});

export const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  searchIndex: {
    embeddingName: OPENAI_EMBEDDING_DEPLOYMENT,
  }
});

export const embed = makeOpenAiEmbedFunc({
  openAiClient,
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});

export const mongodb = new MongoClient(MONGODB_CONNECTION_URI);

export const findContent = makeDefaultFindContentFunc({
  embed,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  },
});

export const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME),
  systemPrompt
);

export const config: AppConfig = {
  conversationsRouterConfig: {
    llm,
    findContent,
    maxChunkContextTokens: 1500,
    conversations,
  },
  maxRequestTimeoutMs: 30000,
};

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  logger.info("Starting server...");
  const app = await makeApp(config);
  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port: ${PORT}`);
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT signal received");
    await mongodb.close();
    await embeddedContentStore.close();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        error ? reject(error) : resolve();
      });
    });
    process.exit(1);
  });
};

try {
  startServer();
} catch (e) {
  logger.error(`Fatal error: ${e}`);
  process.exit(1);
}
```

## Contributing

Currently, we are only accepting contributions from MongoDB employees.

MongoDB employees can refer to the [Contributor Guide](https://github.com/mongodb/chatbot/CONTRIBUTING.md)
for additional info on project set up.

### Setup

#### Node

Node 18 was used to start this project. Please make sure you have Node 18 installed locally. If you have [nvm](https://github.com/nvm-sh/nvm), you can run `nvm use` to switch to the expected version of Node.

#### Install

Use `npm` v8 to install dependencies:

```

npm install

```

#### .env

Use the `.env.example` file to help configure a local `.env` file.

#### External Dependencies

The server relies on some cloud-only services:

- The `content` service relies on Atlas Vector Search.
- The `llm` and embeddings services rely on the OpenAI APIs.

If this is your first time setting up the server, contact a member of the development
team for credentials.

### Running

To start the development server, run:

```

npm run dev

```

By default, the server should be accessible through http://localhost:3000/.

### Testing

Tests are ran by [Jest](https://jestjs.io/) and rely on [Supertest](https://github.com/ladjs/supertest) for testing Express route logic.

To run tests, use:

```

npm run test

```

### Linting & Formatting

We use `eslint` for linting and `prettier` for formatting.

To lint the code and find any warnings or errors, run:

```

npm run lint

```

To format the code, run:

```

npm run format

```
