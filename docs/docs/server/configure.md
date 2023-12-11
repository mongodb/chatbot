# Configure the Chatbot Server

The `mongodb-chatbot-server` is a npm package that you can use
to quickly spin up a chatbot server powered by MongoDB.
The chatbot server supports retrieval augmented generation (RAG).

The package provides configurable Express.js modules including:

- Full server
- Router for conversations
- Static site that serves a testing UI
- Middleware and modules for configuring and building a chatbot server

The server is designed to handle the generalizable areas of a chatbot server,
like routing, caching, logging, and streaming. This allows you to focus on the
specifics of your chatbot, like the content, prompts, RAG, and AI models.

## Installation

Install the package using `npm`:

```sh
npm install mongodb-chatbot-server
```

## Basic Configuration

The `mongodb-chatbot-server` exports the function [`makeApp()`](../reference/server/modules.md#makeapp)
which exports the Express.js app.
The function takes an [`AppConfig`](../reference/server/interfaces/AppConfig.md) object as an argument.

Here's an annotated example configuration and server:

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

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = process.env;

// Create OpenAI client to interface with LLM and Embedding APIs
const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);

// System prompt that is used to guide LLM behavior.
// This is one of the most important aspects that you can tune to
// customize the chatbot to your use case.
const systemPrompt: SystemPrompt = {
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

// Generate user prompt from a user input and context chunks.
// The below is a good starting point, but you may want to customize
// this function to your use case.
async function generateUserPrompt({
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

// Create LLM interface for the chatbot to use.
const llm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  systemPrompt,
  openAiLmmConfigOptions: {
    temperature: 0,
    maxTokens: 500,
  },
  generateUserPrompt,
});

const dataStreamer = makeDataStreamer();

// Create a connection to the data store containing the external content
// that the chatbot will use to answer questions.
// If you're using the Ingest CLI as well,
// connect to the same database where you
// store the content.
const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

// Create an interface to the OpenAI Embedding API. This is used to embed
// user queries. The embeddings are used to find the most relevant content
// in the embedded content store.
const embedder = makeOpenAiEmbedder({
  openAiClient: new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  ),
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
});

// Create a function that finds the most relevant content
// to answer user questions.
const findContent = makeDefaultFindContentFunc({
  embedder,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  },
});

// The conversations service is used to store and retrieve conversations
// from a database.
const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME),
  systemPrompt
);

// Create the configuration object that is passed to the server.
const config: AppConfig = {
  conversationsRouterConfig: {
    dataStreamer,
    llm,
    findContent,
    conversations,
  },
  // When true, the server will serve a static site that can be used to test
  // the chatbot.
  serveStaticSite: true,
};

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  logger.info("Starting server...");
  // Create Express.js app
  const app = await makeApp(config);
  // Start app server
  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port: ${PORT}`);
  });

  // Clean up logic
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

## Examples

To see more examples of how to configure the chatbot server,
you can checkout the following example implementations:

- [MongoDB Docs Chatbot](https://github.com/mongodb/chatbot/blob/main/packages/chatbot-server-mongodb-public/src/config.ts):
  The configuration for the MongoDB Docs chatbot on https://www.mongodb.com/docs/.
  This is the most complex configuration example.
- [Basic Chatbot Server](https://github.com/mongodb/chatbot/blob/main/examples/basic-chatbot-server/src/index.ts):
  A simple chatbot created for example purposes. This can be used as a starting point
  for your own chatbot server.
