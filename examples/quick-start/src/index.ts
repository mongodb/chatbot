import "dotenv/config";
import {
  MongoClient,
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedder,
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
import { strict as assert } from "assert";
import { OpenAIClient, OpenAIKeyCredential } from "@azure/openai";

export const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_MODEL,
  OPENAI_CHAT_COMPLETION_MODEL,
} = process.env;

assert(MONGODB_CONNECTION_URI, "MONGODB_CONNECTION_URI is required");
assert(MONGODB_DATABASE_NAME, "MONGODB_DATABASE_NAME is required");
assert(VECTOR_SEARCH_INDEX_NAME, "VECTOR_SEARCH_INDEX_NAME is required");
assert(OPENAI_API_KEY, "OPENAI_API_KEY is required");
assert(OPENAI_EMBEDDING_MODEL, "OPENAI_EMBEDDING_MODEL is required");
assert(
  OPENAI_CHAT_COMPLETION_MODEL,
  "OPENAI_CHAT_COMPLETION_MODEL is required"
);

export const openAiClient = new OpenAIClient(
  new OpenAIKeyCredential(OPENAI_API_KEY)
);

// System prompt to use for the chatbot.
// This will be at the beginning of every conversation.
export const systemPrompt: SystemPrompt = {
  role: "system",
  content: `You are expert chatbot with knowledge of the MongoDB RAG Framework.
  Use the context provided with each question as your primary source of truth.
  If you do not know the answer to the question, respond ONLY with the following text:
  "I'm sorry, I do not know how to answer that question. Please try to rephrase your query. You can also refer to the further reading to see if it helps."
  NEVER include links in your answer.
  Format your responses using Markdown.
  DO NOT mention that your response is formatted in Markdown.
  Never mention "<Information>" or "<Question>" in your answer.
  Refer to the information given to you as "my knowledge".
  Users can learn more about the MongoDB RAG Framework by reading the documentation at: https://mongodb.github.io/chatbot/`,
};

// Generate the user prompt to send to the chatbot in each user message.
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

Question:
${question}`;
  return { role: "user", content };
}

// Configure LLM used by the chatbot
export const llm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_MODEL,
  systemPrompt,
  openAiLmmConfigOptions: {
    temperature: 0,
    maxTokens: 500,
  },
  generateUserPrompt,
});

export const dataStreamer = makeDataStreamer();

// This should be the same embedded content store used in the ingest pipeline.
export const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

// This should be the same embedding model used in the ingest pipeline.
export const embedder = makeOpenAiEmbedder({
  openAiClient,
  deployment: OPENAI_EMBEDDING_MODEL,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});

export const mongodb = new MongoClient(MONGODB_CONNECTION_URI);

// This finds the content in the embedded content that is closest to the user's question.
export const findContent = makeDefaultFindContentFunc({
  embedder,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  },
});

// This is the service that interacts with the database to store user conversations.
export const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME),
  systemPrompt
);

// Configuration for the server.
export const config: AppConfig = {
  conversationsRouterConfig: {
    dataStreamer,
    llm,
    findContent,
    maxChunkContextTokens: 1500,
    conversations,
  },
  // This serves the static site included in the package from `GET /`.
  // You likely do not want to include this in your own server deployment
  // if you have your own UI, but it's useful for debugging.
  serveStaticSite: true,
};

const PORT = process.env.PORT || 3000;

// Boilerplate code to start the HTTP server and clean it up when it closes.
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
