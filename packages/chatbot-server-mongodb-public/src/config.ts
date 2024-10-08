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
import { addReferenceSourceType } from "./processors/makeMongoDbReferences";
import path from "path";
import express from "express";
import { AzureOpenAI } from "openai";
import { wrapOpenAI, wrapTraced } from "braintrust";
export const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
} = assertEnvVars({
  ...CORE_ENV_VARS,
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT: "",
});

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

export const llm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  openAiLmmConfigOptions: {
    temperature: 0,
    maxTokens: 1000,
  },
});

llm.answerQuestionAwaited = wrapTraced(llm.answerQuestionAwaited, {
  name: "answerQuestionAwaited",
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
embedder.embed = wrapTraced(embedder.embed, { name: "embed" });

export const findContent = wrapTraced(
  makeDefaultFindContent({
    embedder,
    store: embeddedContentStore,
    findNearestNeighborsOptions: {
      k: 5,
      path: "embedding",
      indexName: VECTOR_SEARCH_INDEX_NAME,
      minScore: 0.9,
    },
    searchBoosters: [boostManual],
  }),
  {
    name: "findContent",
  }
);

export const verifiedAnswerStore = makeMongoDbVerifiedAnswerStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  collectionName: "verified_answers",
});

export const findVerifiedAnswer = wrapTraced(
  makeDefaultFindVerifiedAnswer({
    embedder,
    store: verifiedAnswerStore,
  }),
  { name: "findVerifiedAnswer" }
);

export const preprocessorOpenAiClient = wrapOpenAI(
  new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  })
);

export const generateUserPrompt = makeVerifiedAnswerGenerateUserPrompt({
  findVerifiedAnswer,
  onVerifiedAnswerFound: (verifiedAnswer) => {
    return {
      ...verifiedAnswer,
      references: verifiedAnswer.references.map(addReferenceSourceType),
    };
  },
  onNoVerifiedAnswerFound: makeStepBackRagGenerateUserPrompt({
    openAiClient: preprocessorOpenAiClient,
    model: OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
    findContent,
    numPrecedingMessagesToInclude: 6,
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
export const isProduction = process.env.NODE_ENV === "production";
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
    maxInputLengthCharacters: 3000,
  },
  maxRequestTimeoutMs: 60000,
  corsOptions: {
    origin: allowedOrigins,
    // Allow cookies from different origins to be sent to the server.
    credentials: true,
  },
  expressAppConfig: !isProduction
    ? async (app) => {
        const staticAssetsPath = path.join(__dirname, "..", "static");
        app.use(express.static(staticAssetsPath));
      }
    : undefined,
};
