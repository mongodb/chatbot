import "dotenv/config";
import { MongoDB } from "../../src/integrations/mongodb";
import {
  OpenAiChatClient,
  OpenAiEmbeddingsClient,
} from "../../src/integrations/openai";
import { makeConversationsRouter } from "../../src/routes/conversations";
import {
  ContentService,
  ContentServiceOptions,
} from "../../src/services/content";
import { ConversationsService } from "../../src/services/conversations";
import { DataStreamerService } from "../../src/services/dataStreamer";
import {
  EmbeddingService,
  OpenAiEmbeddingProvider,
} from "../../src/services/embeddings";
import { OpenAiLlmProvider } from "../../src/services/llm";

// Set up
const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = process.env;
const openAiLlmClient = new OpenAiChatClient(
  OPENAI_ENDPOINT!,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT!,
  OPENAI_API_KEY!
);
const llm = new OpenAiLlmProvider(openAiLlmClient);
const openaiEmbeddingsClient = new OpenAiEmbeddingsClient(
  OPENAI_ENDPOINT!,
  OPENAI_EMBEDDING_DEPLOYMENT!,
  OPENAI_API_KEY!,
  OPENAI_EMBEDDING_MODEL_VERSION!
);
const openAiEmbeddingProvider = new OpenAiEmbeddingProvider(
  openaiEmbeddingsClient
);
const embeddings = new EmbeddingService(openAiEmbeddingProvider);
const dataStreamer = new DataStreamerService();
const {
  MONGODB_CONNECTION_URI,
  VECTOR_SEARCH_INDEX_NAME,
  MONGODB_DATABASE_NAME,
} = process.env;
const mongodb = new MongoDB(MONGODB_CONNECTION_URI!, MONGODB_DATABASE_NAME!);
const options: ContentServiceOptions = {
  k: 5,
  path: "embedding",
  indexName: VECTOR_SEARCH_INDEX_NAME!,
  minScore: 0.9,
};
const content = new ContentService(mongodb.db, options);
const testConversationsCollection = `conversations-test-${Date.now()}`;
const conversations = new ConversationsService(
  mongodb.mongoClient.db(testConversationsCollection)
);

describe("Conversations Router", () => {
  afterAll(async () => {
    await mongodb.close();
  });

  const conversationsRouter = makeConversationsRouter({
    llm,
    embeddings,
    dataStreamer,
    content,
    conversations,
  });
  describe("POST /conversations/", () => {
    // TODO: test the create conversation route
  });
});
