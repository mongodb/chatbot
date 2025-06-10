/**
  @fileoverview This file contains the configuration implementation for the chat server,
  which is run from `index.ts`.
 */
import "dotenv/config";
import {
  makeMongoDbEmbeddedContentStore,
  makeMongoDbVerifiedAnswerStore,
  makeOpenAiEmbedder,
  makeMongoDbConversationsService,
  AppConfig,
  CORE_ENV_VARS,
  assertEnvVars,
  makeDefaultFindContent,
  requireValidIpAddress,
  requireRequestOrigin,
  AddCustomDataFunc,
  makeDefaultFindVerifiedAnswer,
  defaultCreateConversationCustomData,
  defaultAddMessageToConversationCustomData,
  makeVerifiedAnswerGenerateResponse,
} from "mongodb-chatbot-server";
import cookieParser from "cookie-parser";
import { blockGetRequests } from "./middleware/blockGetRequests";
import { getRequestId, logRequest } from "./utils";
import { systemPrompt } from "./systemPrompt";
import {
  addReferenceSourceType,
  makeMongoDbReferences,
} from "./processors/makeMongoDbReferences";
import { redactConnectionUri } from "./middleware/redactConnectionUri";
import path from "path";
import express from "express";
import { logger } from "mongodb-rag-core";
import {
  wrapOpenAI,
  wrapTraced,
  wrapAISDKModel,
} from "mongodb-rag-core/braintrust";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { MongoClient } from "mongodb-rag-core/mongodb";
import {
  ANALYZER_ENV_VARS,
  AZURE_OPENAI_ENV_VARS,
  PREPROCESSOR_ENV_VARS,
  TRACING_ENV_VARS,
} from "./EnvVars";
import {
  makeAddMessageToConversationUpdateTrace,
  makeCommentMessageUpdateTrace,
  makeRateMessageUpdateTrace,
} from "./tracing/routesUpdateTraceHandlers";
import { useSegmentIds } from "./middleware/useSegmentIds";
import { makeSearchTool } from "./tools/search";
import { makeMongoDbInputGuardrail } from "./processors/mongoDbInputGuardrail";
import { makeGenerateResponseWithSearchTool } from "./processors/generateResponseWithSearchTool";
import { makeBraintrustLogger } from "mongodb-rag-core/braintrust";
import { makeMongoDbScrubbedMessageStore } from "./tracing/scrubbedMessages/MongoDbScrubbedMessageStore";
import { MessageAnalysis } from "./tracing/scrubbedMessages/analyzeMessage";
import { createAzure } from "mongodb-rag-core/aiSdk";

export const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  OPENAI_VERIFIED_ANSWER_EMBEDDING_DEPLOYMENT,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_ANALYZER_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_RESOURCE_NAME,
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
} = assertEnvVars({
  ...CORE_ENV_VARS,
  ...PREPROCESSOR_ENV_VARS,
  ...AZURE_OPENAI_ENV_VARS,
  ...TRACING_ENV_VARS,
});

// Optional env vars
const {
  BRAINTRUST_CHATBOT_TRACING_PROJECT_NAME,
  SLACK_BOT_TOKEN,
  SLACK_COMMENT_CONVERSATION_ID,
  SEGMENT_WRITE_KEY,
} = process.env;

export const braintrustLogger = makeBraintrustLogger({
  apiKey: process.env.BRAINTRUST_TRACING_API_KEY,
  projectName: process.env.BRAINTRUST_CHATBOT_TRACING_PROJECT_NAME,
});

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

export const openAiClient = wrapOpenAI(
  new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  })
);

// For parts of the application that use the Vercel AI SDK
export const azure = createAzure({
  apiKey: OPENAI_API_KEY,
  resourceName: OPENAI_RESOURCE_NAME,
  apiVersion: OPENAI_API_VERSION,
});

export const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  searchIndex: {
    embeddingName: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  },
});

export const verifiedAnswerConfig = {
  embeddingModel: OPENAI_VERIFIED_ANSWER_EMBEDDING_DEPLOYMENT,
  findNearestNeighborsOptions: {
    minScore: 0.96,
  },
};
export const retrievalConfig = {
  preprocessorLlm: OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
  embeddingModel: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  findNearestNeighborsOptions: {
    k: 5,
    path: embeddedContentStore.metadata.embeddingPath,
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.75,
  },
};

export const embedder = makeOpenAiEmbedder({
  openAiClient,
  deployment: retrievalConfig.embeddingModel,
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
    findNearestNeighborsOptions: retrievalConfig.findNearestNeighborsOptions,
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

const verifiedAnswersEmbedder = makeOpenAiEmbedder({
  openAiClient,
  deployment: verifiedAnswerConfig.embeddingModel,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});
verifiedAnswersEmbedder.embed = wrapTraced(verifiedAnswersEmbedder.embed, {
  name: "embedVerifiedAnswers",
});

export const findVerifiedAnswer = wrapTraced(
  makeDefaultFindVerifiedAnswer({
    embedder: verifiedAnswersEmbedder,
    store: verifiedAnswerStore,
    findNearestNeighborsOptions:
      verifiedAnswerConfig.findNearestNeighborsOptions,
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
export const mongodb = new MongoClient(MONGODB_CONNECTION_URI);

export const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME)
);
const azureOpenAi = createAzure({
  apiKey: OPENAI_API_KEY,
  resourceName: process.env.OPENAI_RESOURCE_NAME,
});
const languageModel = wrapAISDKModel(azureOpenAi("gpt-4.1"));

const guardrailLanguageModel = wrapAISDKModel(azureOpenAi("gpt-4.1-mini"));
const inputGuardrail = makeMongoDbInputGuardrail({
  model: guardrailLanguageModel,
});

export const generateResponse = wrapTraced(
  makeVerifiedAnswerGenerateResponse({
    findVerifiedAnswer,
    onVerifiedAnswerFound: (verifiedAnswer) => {
      return {
        ...verifiedAnswer,
        references: verifiedAnswer.references.map(addReferenceSourceType),
      };
    },
    onNoVerifiedAnswerFound: wrapTraced(
      makeGenerateResponseWithSearchTool({
        languageModel,
        systemMessage: systemPrompt,
        makeReferenceLinks: makeMongoDbReferences,
        inputGuardrail,
        llmRefusalMessage:
          conversations.conversationConstants.NO_RELEVANT_CONTENT,
        filterPreviousMessages: async (conversation) => {
          return conversation.messages.filter((message) => {
            return (
              message.role === "user" ||
              // Only include assistant messages that are not tool calls
              (message.role === "assistant" && !message.toolCall)
            );
          });
        },
        llmNotWorkingMessage:
          conversations.conversationConstants.LLM_NOT_WORKING,
        searchTool: makeSearchTool(findContent),
        toolChoice: "auto",
        maxSteps: 5,
      }),
      { name: "makeStepBackRagGenerateUserPrompt" }
    ),
  }),
  {
    name: "generateUserPrompt",
  }
);

export const createConversationCustomDataWithAuthUser: AddCustomDataFunc =
  async (req, res) => {
    const customData = await defaultCreateConversationCustomData(req, res);
    if (req.cookies.auth_user) {
      customData.authUser = req.cookies.auth_user;
    }
    logRequest({
      reqId: getRequestId(req),
      message: `Custom data: ${customData}`,
    });
    return customData;
  };
export const isProduction = process.env.NODE_ENV === "production";

const scrubbedMessageStore = makeMongoDbScrubbedMessageStore<MessageAnalysis>({
  db: mongodb.db(MONGODB_DATABASE_NAME),
});

const llmAsAJudgeConfig = {
  judgeModel: JUDGE_LLM,
  judgeEmbeddingModel: JUDGE_EMBEDDING_MODEL,
  openAiConfig: {
    azureOpenAi: {
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      apiVersion: OPENAI_API_VERSION,
    },
  },
};

const segmentConfig = SEGMENT_WRITE_KEY
  ? {
      writeKey: SEGMENT_WRITE_KEY,
    }
  : undefined;

export async function closeDbConnections() {
  await mongodb.close();
  await verifiedAnswerStore.close();
  await embeddedContentStore.close();
}

logger.info(`Segment logging is ${segmentConfig ? "enabled" : "disabled"}`);

export const config: AppConfig = {
  conversationsRouterConfig: {
    middleware: [
      blockGetRequests,
      requireValidIpAddress(),
      requireRequestOrigin(),
      useSegmentIds(),
      redactConnectionUri(),
      cookieParser(),
    ],
    createConversationCustomData: !isProduction
      ? createConversationCustomDataWithAuthUser
      : undefined,
    addMessageToConversationCustomData: async (req, res) => {
      const defaultCustomData = await defaultAddMessageToConversationCustomData(
        req,
        res
      );
      return {
        ...defaultCustomData,
        segmentUserId: res.locals.customData.segmentUserId ?? undefined,
        segmentAnonymousId:
          res.locals.customData.segmentAnonymousId ?? undefined,
      };
    },
    addMessageToConversationUpdateTrace:
      makeAddMessageToConversationUpdateTrace({
        k: retrievalConfig.findNearestNeighborsOptions.k,
        llmAsAJudge: {
          ...llmAsAJudgeConfig,
          percentToJudge: isProduction ? 0.1 : 1,
        },
        segment: segmentConfig,
        braintrustLogger,
        embeddingModelName: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
        scrubbedMessageStore,
        analyzerModel: wrapAISDKModel(
          azure(OPENAI_ANALYZER_CHAT_COMPLETION_DEPLOYMENT)
        ),
      }),
    rateMessageUpdateTrace: makeRateMessageUpdateTrace({
      llmAsAJudge: llmAsAJudgeConfig,
      segment: segmentConfig,
      scrubbedMessageStore,
      braintrustLogger,
    }),
    commentMessageUpdateTrace: makeCommentMessageUpdateTrace({
      openAiClient,
      judgeLlm: JUDGE_LLM,
      slack:
        SLACK_BOT_TOKEN !== undefined &&
        SLACK_COMMENT_CONVERSATION_ID !== undefined
          ? {
              token: SLACK_BOT_TOKEN,
              conversationId: SLACK_COMMENT_CONVERSATION_ID,
              llmAsAJudge: llmAsAJudgeConfig,
              braintrust: BRAINTRUST_CHATBOT_TRACING_PROJECT_NAME
                ? {
                    orgName: "mongodb-education-ai",
                    projectName: BRAINTRUST_CHATBOT_TRACING_PROJECT_NAME,
                  }
                : undefined,
            }
          : undefined,
      segment: segmentConfig,
      scrubbedMessageStore,
      braintrustLogger,
    }),
    generateResponse,
    maxUserMessagesInConversation: 50,
    maxUserCommentLength: 500,
    conversations,
    maxInputLengthCharacters: 3000,
    braintrustLogger,
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
