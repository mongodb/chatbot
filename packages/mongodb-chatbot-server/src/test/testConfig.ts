import "dotenv/config";
import {
  EmbeddedContent,
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedder,
  makeMongoDbVerifiedAnswerStore,
  makeDefaultFindContent,
  CORE_ENV_VARS,
  assertEnvVars,
  makeMongoDbConversationsService,
  SystemMessage,
} from "mongodb-rag-core";
import { MongoClient, Db } from "mongodb-rag-core/mongodb";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { stripIndents } from "common-tags";
import { AppConfig } from "../app";
import { GenerateResponse, makeFilterNPreviousMessages } from "../processors";
import { makeDefaultReferenceLinks } from "../processors/makeDefaultReferenceLinks";
import { MONGO_MEMORY_SERVER_URI } from "./constants";

let mongoClient: MongoClient | undefined;
export let memoryDb: Db;
const uri = MONGO_MEMORY_SERVER_URI;
beforeAll(async () => {
  const testDbName = `conversations-test-${Date.now()}`;
  mongoClient = new MongoClient(uri);
  memoryDb = mongoClient.db(testDbName);
});

afterAll(async () => {
  await memoryDb?.dropDatabase();
  await mongoClient?.close();
  await embeddedContentStore.close();
  await verifiedAnswerStore.close();
});
export const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_API_VERSION,
} = assertEnvVars(CORE_ENV_VARS);

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

export const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});

export const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  searchIndex: {
    embeddingName: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  },
});

export const verifiedAnswerStore = makeMongoDbVerifiedAnswerStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  collectionName: "verified_answers",
});

export const embedder = makeOpenAiEmbedder({
  openAiClient,
  deployment: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});

export const findContent = makeDefaultFindContent({
  embedder,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.7,
  },
});

export const REJECT_QUERY_CONTENT = "REJECT_QUERY";
export const NO_VECTOR_CONTENT = "NO_VECTOR_CONTENT";

export const systemPrompt: SystemMessage = {
  role: "system",
  content: stripIndents`You're just a mock chatbot. What you think and say does not matter.`,
};

/**
  MongoDB Chatbot implementation of {@link MakeReferenceLinksFunc}.
  Returns references that look like:

  ```js
  {
    url: "https://mongodb.com/docs/manual/reference/operator/query/eq/?tck=docs-chatbot",
    title: "https://docs.mongodb.com/manual/reference/operator/query/eq/"
  }
  ```
 */
export function makeMongoDbReferences(chunks: EmbeddedContent[]) {
  const baseReferences = makeDefaultReferenceLinks(
    chunks.map((chunk) => ({
      title: chunk.metadata?.pageTitle ?? chunk.url,
      url: chunk.url,
      text: chunk.text,
    }))
  );
  return baseReferences.map((ref) => {
    const url = new URL(ref.url);
    return {
      url: url.href,
      title: url.origin + url.pathname,
    };
  });
}

export const filterPrevious12Messages = makeFilterNPreviousMessages(12);

export const mockAssistantResponse = {
  role: "assistant" as const,
  content: "some content",
};

export const mockGenerateResponse: GenerateResponse = async ({
  latestMessageText,
  customData,
  dataStreamer,
  shouldStream,
}) => {
  if (shouldStream) {
    dataStreamer?.streamData({
      type: "delta",
      data: mockAssistantResponse.content,
    });
    dataStreamer?.streamData({
      type: "references",
      data: [
        {
          url: "https://mongodb.com",
          title: "mongodb.com",
        },
      ],
    });
    dataStreamer?.streamData({
      type: "finished",
      data: "",
    });
  }
  return {
    messages: [
      {
        role: "user" as const,
        content: latestMessageText,
        customData,
      },
      { ...mockAssistantResponse },
    ],
  };
};

export async function makeDefaultConfig(): Promise<AppConfig> {
  const conversations = makeMongoDbConversationsService(memoryDb);
  return {
    conversationsRouterConfig: {
      generateResponse: mockGenerateResponse,
      conversations,
    },
    maxRequestTimeoutMs: 30000,
    corsOptions: {
      origin: allowedOrigins,
    },
  };
}
