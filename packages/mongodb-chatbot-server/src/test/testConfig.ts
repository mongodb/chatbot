/**
  @fileoverview This file contains the configuration implementation for the chat server,
  which is run from `index.ts`.
 */
import "dotenv/config";
import {
  EmbeddedContent,
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedder,
  makeMongoDbVerifiedAnswerStore,
  makeBoostOnAtlasSearchFilter,
  makeDefaultFindContent,
  CORE_ENV_VARS,
  assertEnvVars,
  makeMongoDbConversationsService,
  makeOpenAiChatLlm,
  SystemPrompt,
  UserMessage,
  defaultConversationConstants,
} from "mongodb-rag-core";
import { MongoClient, Db } from "mongodb-rag-core/mongodb";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { stripIndents } from "common-tags";
import { AppConfig } from "../app";
import {
  GenerateUserPromptFunc,
  MakeUserMessageFunc,
  MakeUserMessageFuncParams,
  makeFilterNPreviousMessages,
} from "../processors";
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

/**
  Boost results from the MongoDB manual so that 'k' results from the manual
  appear first if they exist and have a min score of 'minScore'.
 */
export const boostManual = makeBoostOnAtlasSearchFilter({
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
    minScore: 0.9,
  },
  searchBoosters: [boostManual],
});

export const makeUserMessage: MakeUserMessageFunc = async function ({
  preprocessedUserMessage,
  originalUserMessage,
  content,
}: MakeUserMessageFuncParams): Promise<UserMessage> {
  const chunkSeparator = "~~~~~~";
  const context = content.map((c) => c.text).join(`\n${chunkSeparator}\n`);
  const contentForLlm = `Using the following information, answer the question.
Different pieces of information are separated by "${chunkSeparator}".

<Information>
${context}
<End information>

<Question>
${preprocessedUserMessage ?? originalUserMessage}
<End Question>`;
  return {
    role: "user",
    contentForLlm,
    content: originalUserMessage,
    preprocessedContent: preprocessedUserMessage,
  };
};

export const REJECT_QUERY_CONTENT = "REJECT_QUERY";
export const NO_VECTOR_CONTENT = "NO_VECTOR_CONTENT";
export const fakeGenerateUserPrompt: GenerateUserPromptFunc = async (args) => {
  const noVectorContent = args.userMessageText === NO_VECTOR_CONTENT;
  return {
    userMessage: {
      role: "user",
      content: args.userMessageText,
    },
    references: noVectorContent
      ? []
      : [
          {
            url: "https://mongodb.com/docs/manual/reference/operator/query/eq/?tck=docs-chatbot",
            title: "$eq",
          },
        ],
    rejectQuery: args.userMessageText === REJECT_QUERY_CONTENT,
    staticResponse: noVectorContent
      ? {
          content: defaultConversationConstants.NO_RELEVANT_CONTENT,
          role: "assistant",
          references: [],
        }
      : undefined,
  };
};

export const systemPrompt: SystemPrompt = {
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

export const llm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  openAiLmmConfigOptions: {
    temperature: 0,
    max_tokens: 500,
  },
});

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
  const baseReferences = makeDefaultReferenceLinks(chunks);
  return baseReferences.map((ref: { url: string }) => {
    const url = new URL(ref.url);
    return {
      url: url.href,
      title: url.origin + url.pathname,
    };
  });
}

export const filterPrevious12Messages = makeFilterNPreviousMessages(12);

export async function makeDefaultConfig(): Promise<AppConfig> {
  const conversations = makeMongoDbConversationsService(memoryDb);
  return {
    conversationsRouterConfig: {
      llm,
      generateUserPrompt: fakeGenerateUserPrompt,
      filterPreviousMessages: filterPrevious12Messages,
      systemPrompt,
      conversations,
    },
    maxRequestTimeoutMs: 30000,
    corsOptions: {
      origin: allowedOrigins,
    },
  };
}
