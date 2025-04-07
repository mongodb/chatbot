# Configure the Chatbot Server

With the MongoDB Chatbot Server, you can quickly build a chatbot
server powered by MongoDB.
The `mongodb-chatbot-server` is an npm package contains all the modules
of the MongoDB Chatbot Server.

The chatbot server supports retrieval augmented generation (RAG).
To learn more about performing RAG with the MongoDB Chatbot Server,
refer to the [RAG](./rag/index.md) guide.

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
/**
  @fileoverview This file contains the configuration implementation for the chat server,
  which is run from `index.ts`.
 */
import "dotenv/config";
import {
  EmbeddedContent,
  MongoClient,
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedder,
  makeMongoDbConversationsService,
  makeDataStreamer,
  makeOpenAiChatLlm,
  AppConfig,
  makeBoostOnAtlasSearchFilter,
  CORE_ENV_VARS,
  assertEnvVars,
  makeDefaultFindContent,
  makeDefaultReferenceLinks,
  SystemPrompt,
  GenerateUserPromptFunc,
  makeRagGenerateUserPrompt,
  MakeUserMessageFunc,
  MakeUserMessageFuncParams,
  UserMessage,
} from "mongodb-chatbot-server";
import { stripIndents } from "common-tags";
import { AzureOpenAI } from "mongodb-rag-core/openai";

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = process.env;

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

/**
  Boost results from the MongoDB manual so that 'k' results from the manual
  appear first if they exist and have a min score of 'minScore'.
 */
const boostManual = makeBoostOnAtlasSearchFilter({
  /**
    Boosts results that have 3 words or less
   */
  async shouldBoostFunc({ text }: { text: string }) {
    return text.split(" ").filter((s) => s !== " ").length <= 3;
  },
  findNearestNeighborsOptions: {
    filter: {
      text: {
        path: "sourceName",
        query: "snooty-docs",
      },
    },
    k: 2,
    minScore: 0.88,
  },
  totalMaxK: 5,
});

const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});
const systemPrompt: SystemPrompt = {
  role: "system",
  content: stripIndents`You are expert MongoDB documentation chatbot.
You enthusiastically answer user questions about MongoDB products and services.
Your personality is friendly and helpful, like a professor or tech lead.
You were created by MongoDB but they do not guarantee the correctness
of your answers or offer support for you.
Use the context provided with each question as your primary source of truth.
NEVER lie or improvise incorrect answers.
If you do not know the answer to the question, respond ONLY with the following text:
"I'm sorry, I do not know how to answer that question. Please try to rephrase your query. You can also refer to the further reading to see if it helps."
NEVER include links in your answer.
Format your responses using Markdown.
DO NOT mention that your response is formatted in Markdown.
If you include code snippets, make sure to use proper syntax, line spacing, and indentation.
ONLY use code snippets present in the information given to you.
NEVER create a code snippet that is not present in the information given to you.
You ONLY know about the current version of MongoDB products. Versions are provided in the information. If \`version: null\`, then say that the product is unversioned.
Never mention "<Information>" or "<Question>" in your answer.
Refer to the information given to you as "my knowledge".`,
};

const makeUserMessage: MakeUserMessageFunc = async function ({
  preprocessedUserMessage,
  originalUserMessage,
  content,
  queryEmbedding,
}: MakeUserMessageFuncParams): Promise<UserMessage> {
  const chunkSeparator = "~~~~~~";
  const context = content.map((c) => c.text).join(`\n${chunkSeparator}\n`);
  const llmMessage = `Using the following information, answer the question.
Different pieces of information are separated by "${chunkSeparator}".

<Information>
${context}
<End information>

<Question>
${preprocessedUserMessage ?? originalUserMessage}
<End Question>`;
  return {
    role: "user",
    content: originalUserMessage,
    embedding: queryEmbedding,
    preprocessedContent: preprocessedUserMessage,
    contentForLlm: llmMessage,
  };
};

const llm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  openAiLmmConfigOptions: {
    temperature: 0,
    maxTokens: 500,
  },
});

const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  searchIndex: {
    embeddingName: OPENAI_EMBEDDING_DEPLOYMENT,
  }
});

const embedder = makeOpenAiEmbedder({
  openAiClient,
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});

const findContent = makeDefaultFindContent({
  embedder,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    // Note: you may want to adjust the minScore depending
    // on the embedding model you use. We've found 0.9 works well
    // for OpenAI's text-embedding-ada-02 model for most use cases,
    // but you may want to adjust this value if you're using a different model.
    minScore: 0.9,
  },
  searchBoosters: [boostManual],
});

const generateUserPrompt: GenerateUserPromptFunc = makeRagGenerateUserPrompt({
  findContent,
  makeUserMessage,
});

const mongodb = new MongoClient(MONGODB_CONNECTION_URI);

const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME)
);

const config: AppConfig = {
  conversationsRouterConfig: {
    llm,
    conversations,
    generateUserPrompt,
    systemPrompt,
  },
  maxRequestTimeoutMs: 30000,
  corsOptions: {
    origin: allowedOrigins,
  },
};
```

## Examples

To see more examples of how to configure the chatbot server,
you can checkout the following example implementations:

- [MongoDB Docs Chatbot](https://github.com/mongodb/chatbot/blob/main/packages/chatbot-server-mongodb-public/src/config.ts):
  The configuration for the MongoDB Docs chatbot on https://www.mongodb.com/docs/.
  This is the most complex configuration example.
- [Basic Chatbot Server](https://github.com/mongodb/chatbot/blob/main/examples/quick-start/packages/server):
  A simple chatbot created for example purposes. This can be used as a starting point
  for your own chatbot server.
