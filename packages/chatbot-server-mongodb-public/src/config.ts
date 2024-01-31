/**
  @fileoverview This file contains the configuration implementation for the chat server,
  which is run from `index.ts`.
 */
import "dotenv/config";
import {
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
  SystemPrompt,
  GenerateUserPromptFunc,
  requireRequestOrigin,
  requireValidIpAddress,
  ConversationCustomData,
  AddCustomDataFunc,
} from "mongodb-chatbot-server";
import { stripIndents } from "common-tags";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import cookieParser from "cookie-parser";
import { makeStepBackRagGenerateUserPrompt } from "./processors/makeStepBackRagGenerateUserPrompt";

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
      sourceName: "snooty-docs",
    },
    k: 2,
    minScore: 0.88,
  },
  totalMaxK: 5,
});

export const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);
export const systemPrompt: SystemPrompt = {
  role: "system",
  content: stripIndents`You are expert MongoDB documentation chatbot.
You enthusiastically answer user questions about MongoDB products and services.
Your personality is friendly and helpful, like a professor or tech lead.
You were created by MongoDB.
Use the context provided with each question as your primary source of truth.
If you do not know the answer to the question based on the provided documentation content, respond with the following text:
"I'm sorry, I do not know how to answer that question. Please try to rephrase your query."
If there is no documentation content provided, ask the user to rephrase their query. Provide a few suggestions for how to rephrase the query.
NEVER include links in your answer.
Format your responses using Markdown. DO NOT mention that your response is formatted in Markdown.
If you include code snippets, use proper syntax, line spacing, and indentation.
You ONLY know about the current version of MongoDB products. Versions are provided in the information. If \`version: null\`, then say that the product is unversioned.`,
};

export const llm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  openAiLmmConfigOptions: {
    temperature: 0,
    maxTokens: 500,
  },
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

export const generateUserPrompt: GenerateUserPromptFunc =
  makeStepBackRagGenerateUserPrompt({
    openAiClient,
    deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    findContent,
    numPrecedingMessagesToInclude: 2,
  });

export const mongodb = new MongoClient(MONGODB_CONNECTION_URI);

export const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME),
  systemPrompt
);

export const createCustomConversationDataWithIpAuthUserAndOrigin: AddCustomDataFunc =
  async (req, res) => {
    const customData: ConversationCustomData = {};
    console.log("!!!req.cookies", req.cookies);
    if (req.cookies.auth_user) {
      console.log("!!!auth_user", req.cookies.auth_user);
      customData.authUser = req.cookies.auth_user;
    }
    if (req.ip) {
      customData.ip = req.ip;
    }
    if (res.locals.customData.origin) {
      customData.origin = res.locals.customData.origin;
    }
    return customData;
  };

const isProduction = process.env.NODE_ENV === "production";
console.log({ isProduction });
export const config: AppConfig = {
  conversationsRouterConfig: {
    dataStreamer,
    llm,
    conversations,
    middleware: [
      requireRequestOrigin(),
      requireValidIpAddress(),
      cookieParser(),
    ],
    createConversationCustomData: !isProduction
      ? createCustomConversationDataWithIpAuthUserAndOrigin
      : undefined,
    generateUserPrompt,
    maxUserMessagesInConversation: 50,
    maxUserCommentLength: 500,
  },
  maxRequestTimeoutMs: 30000,
  corsOptions: {
    origin: allowedOrigins,
    credentials: !isProduction,
  },
  serveStaticSite: !isProduction,
};
