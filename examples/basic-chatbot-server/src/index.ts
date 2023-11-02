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
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";

export const {
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

export const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);
export const systemPrompt: SystemPrompt = {
  role: "system",
  content: `You are expert MongoDB documentation chatbot.
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

export const dataStreamer = makeDataStreamer();

export const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

export const embedder = makeOpenAiEmbedder({
  openAiClient,
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});

export const mongodb = new MongoClient(MONGODB_CONNECTION_URI);

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

export const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME),
  systemPrompt
);

export const config: AppConfig = {
  conversationsRouterConfig: {
    dataStreamer,
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
