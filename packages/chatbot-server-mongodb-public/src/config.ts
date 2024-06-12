/**
  @fileoverview This file contains the configuration implementation for the chat server,
  which is run from `index.ts`.
 */
import "dotenv/config";
import {
  MongoClient,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbVerifiedAnswerStore,
  makeOpenAiEmbedder,
  makeMongoDbConversationsService,
  makeOpenAiChatLlm,
  AppConfig,
  makeBoostOnAtlasSearchFilter,
  CORE_ENV_VARS,
  assertEnvVars,
  makeDefaultFindContent,
  requireValidIpAddress,
  requireRequestOrigin,
  AddCustomDataFunc,
  ConversationCustomData,
  makeVerifiedAnswerGenerateUserPrompt,
  makeDefaultFindVerifiedAnswer,
} from "mongodb-chatbot-server";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import cookieParser from "cookie-parser";
import { makeStepBackRagGenerateUserPrompt } from "./processors/makeStepBackRagGenerateUserPrompt";
import { blockGetRequests } from "./middleware/blockGetRequests";
import { getRequestId, logRequest } from "./utils";
import { systemPrompt } from "./systemPrompt";

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
  new AzureKeyCredential(OPENAI_API_KEY),
  {
    // Allow insecure connection when in staging/production
    // b/c connecting w/in the same k8s cluster
    allowInsecureConnection:
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging",
    // If connecting to Radiant over the internet,
    // you must include a MongoDB CorpSecure cookie in the request.
    additionalPolicies:
      process.env.AUTH_COOKIE && typeof process.env.AUTH_COOKIE === "string"
        ? [
            {
              position: "perCall",
              policy: {
                name: "add-cookie",
                sendRequest(request, next) {
                  request.headers.set(
                    "Cookie",
                    process.env.AUTH_COOKIE as string
                  );

                  return next(request);
                },
              },
            },
          ]
        : undefined,
  }
);

export const llm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  openAiLmmConfigOptions: {
    temperature: 0,
    maxTokens: 500,
  },
});

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

export const verifiedAnswerStore = makeMongoDbVerifiedAnswerStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  collectionName: "verified_answers",
});

export const findVerifiedAnswer = makeDefaultFindVerifiedAnswer({
  embedder,
  store: verifiedAnswerStore,
});

export const generateUserPrompt = makeVerifiedAnswerGenerateUserPrompt({
  findVerifiedAnswer,
  onNoVerifiedAnswerFound: makeStepBackRagGenerateUserPrompt({
    openAiClient,
    deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    findContent,
    numPrecedingMessagesToInclude: 2,
  }),
});

export const mongodb = new MongoClient(MONGODB_CONNECTION_URI);

export const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME)
);

export const createCustomConversationDataWithIpAuthUserAndOrigin: AddCustomDataFunc =
  async (req, res) => {
    const customData: ConversationCustomData = {};
    if (req.cookies.auth_user) {
      customData.authUser = req.cookies.auth_user;
    }
    if (req.ip) {
      customData.ip = req.ip;
    }
    if (res.locals.customData.origin) {
      customData.origin = res.locals.customData.origin;
    }
    logRequest({
      reqId: getRequestId(req),
      message: `Custom data: ${customData}`,
    });
    return customData;
  };

const isProduction = process.env.NODE_ENV === "production";
export const config: AppConfig = {
  conversationsRouterConfig: {
    llm,
    middleware: [
      blockGetRequests,
      requireValidIpAddress(),
      requireRequestOrigin(),
      cookieParser(),
    ],
    createConversationCustomData: !isProduction
      ? createCustomConversationDataWithIpAuthUserAndOrigin
      : undefined,
    generateUserPrompt,
    systemPrompt,
    maxUserMessagesInConversation: 50,
    maxUserCommentLength: 500,
    conversations,
  },
  maxRequestTimeoutMs: 30000,
  corsOptions: {
    origin: allowedOrigins,
    // Allow cookies from different origins to be sent to the server.
    credentials: true,
  },
  serveStaticSite: !isProduction,
};
