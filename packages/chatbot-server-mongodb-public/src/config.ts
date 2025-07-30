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
  FilterPreviousMessages,
  makeDefaultFindVerifiedAnswer,
  defaultCreateConversationCustomData,
  defaultAddMessageToConversationCustomData,
  makeVerifiedAnswerGenerateResponse,
  addMessageToConversationVerifiedAnswerStream,
  responsesVerifiedAnswerStream,
  type MakeVerifiedAnswerGenerateResponseParams,
} from "mongodb-chatbot-server";
import cookieParser from "cookie-parser";
import { blockGetRequests } from "./middleware/blockGetRequests";
import { getRequestId, logRequest } from "./utils";
import {
  addReferenceSourceType,
  makeMongoDbReferences,
} from "./processors/makeMongoDbReferences";
import { redactConnectionUri } from "./middleware/redactConnectionUri";
import path from "path";
import express from "express";
import {
  makeMongoDbPageStore,
  logger,
  BRAINTRUST_ENV_VARS,
} from "mongodb-rag-core";
import { wrapOpenAI, wrapTraced } from "mongodb-rag-core/braintrust";
import { AzureOpenAI, OpenAI } from "mongodb-rag-core/openai";
import { MongoClient } from "mongodb-rag-core/mongodb";
import {
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
import {
  makeGenerateResponseWithTools,
  type GenerateResponseWithToolsParams,
  responsesApiStream,
  addMessageToConversationStream,
} from "./processors/generateResponseWithTools";
import {
  makeBraintrustLogger,
  BraintrustMiddleware,
} from "mongodb-rag-core/braintrust";
import { makeMongoDbScrubbedMessageStore } from "./tracing/scrubbedMessages/MongoDbScrubbedMessageStore";
import { MessageAnalysis } from "./tracing/scrubbedMessages/analyzeMessage";
import {
  createAzure,
  createOpenAI,
  wrapLanguageModel,
} from "mongodb-rag-core/aiSdk";
import { makeMongoDbAssistantSystemPrompt } from "./systemPrompt";
import { makeFetchPageTool } from "./tools/fetchPage";
import { makeCorsOptions } from "./corsOptions";

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

  OPENAI_RESOURCE_NAME,
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
} = assertEnvVars({
  ...CORE_ENV_VARS,
  ...PREPROCESSOR_ENV_VARS,
  ...AZURE_OPENAI_ENV_VARS,
  ...TRACING_ENV_VARS,
  ...BRAINTRUST_ENV_VARS,
});

const braintrustOpenAi = new OpenAI({
  apiKey: BRAINTRUST_API_KEY,
  baseURL: BRAINTRUST_ENDPOINT,
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

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") ?? [];

export const embeddingOpenAiClient = wrapOpenAI(
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
  embeddingModel: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  findNearestNeighborsOptions: {
    k: 5,
    path: embeddedContentStore.metadata.embeddingPath,
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.75,
  },
};

export const embedder = makeOpenAiEmbedder({
  openAiClient: embeddingOpenAiClient,
  deployment: retrievalConfig.embeddingModel,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});
embedder.embed = wrapTraced(embedder.embed, { name: "embed" });

embeddedContentStore.findNearestNeighbors = wrapTraced(
  embeddedContentStore.findNearestNeighbors,
  { name: "findNearestNeighbors" }
);

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
  openAiClient: embeddingOpenAiClient,
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

export const pageStore = makeMongoDbPageStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

export const loadPage = wrapTraced(pageStore.loadPage, {
  name: "loadPageFromStore",
});

export const preprocessorOpenAiClient = wrapOpenAI(
  new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  })
);
const preprocessorModel = "us.amazon.nova-lite-v1:0";
export const mongodb = new MongoClient(MONGODB_CONNECTION_URI);

export const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME)
);
const openai = createOpenAI({
  apiKey: BRAINTRUST_API_KEY,
  baseURL: BRAINTRUST_ENDPOINT,
});

const mainModel = "us.anthropic.claude-sonnet-4-20250514-v1:0";
const languageModel = wrapLanguageModel({
  model: openai.chat(mainModel),
  middleware: [BraintrustMiddleware({ debug: true })],
});

const guardrailLanguageModel = wrapLanguageModel({
  model: openai.chat(preprocessorModel),
  middleware: [BraintrustMiddleware({ debug: true })],
});
const inputGuardrail = wrapTraced(
  makeMongoDbInputGuardrail({
    model: guardrailLanguageModel,
  }),
  {
    name: "inputGuardrail",
  }
);

export const filterPreviousMessages: FilterPreviousMessages = async (
  conversation
) => {
  return conversation.messages.filter((message) => {
    return (
      message.role === "user" ||
      // Only include assistant messages that are not tool calls
      (message.role === "assistant" && !message.toolCall)
    );
  });
};

export const toolChoice = "auto";

export const maxSteps = 5;

interface MakeGenerateResponseParams {
  responseWithSearchToolStream: GenerateResponseWithToolsParams["stream"];
  verifiedAnswerStream: MakeVerifiedAnswerGenerateResponseParams["stream"];
}

export const makeGenerateResponse = (args?: MakeGenerateResponseParams) =>
  wrapTraced(
    makeVerifiedAnswerGenerateResponse({
      findVerifiedAnswer,
      onVerifiedAnswerFound: (verifiedAnswer) => {
        return {
          ...verifiedAnswer,
          references: verifiedAnswer.references.map(addReferenceSourceType),
        };
      },
      stream: args?.verifiedAnswerStream,
      onNoVerifiedAnswerFound: wrapTraced(
        makeGenerateResponseWithTools({
          languageModel,
          makeSystemPrompt: makeMongoDbAssistantSystemPrompt,
          inputGuardrail,
          llmRefusalMessage:
            conversations.conversationConstants.NO_RELEVANT_CONTENT,
          filterPreviousMessages,
          llmNotWorkingMessage:
            conversations.conversationConstants.LLM_NOT_WORKING,
          searchTool: makeSearchTool({
            findContent,
            makeReferences: makeMongoDbReferences,
          }),
          fetchPageTool: makeFetchPageTool({
            loadPage,
            findContent,
            makeReferences: makeMongoDbReferences,
          }),
          maxSteps,
          stream: args?.responseWithSearchToolStream,
        }),
        { name: "generateResponseWithSearchTool" }
      ),
    }),
    {
      name: "generateResponse",
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
  judgeModel: preprocessorModel,
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
  await pageStore.close();
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
      const customData = {
        ...defaultCustomData,
      };
      if (res.locals.customData.segmentUserId) {
        customData.segmentUserId = res.locals.customData.segmentUserId;
      }
      if (res.locals.customData.segmentAnonymousId) {
        customData.segmentAnonymousId =
          res.locals.customData.segmentAnonymousId;
      }
      return customData;
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
        analyzerModel: wrapLanguageModel({
          model: openai.chat(preprocessorModel),
          middleware: [BraintrustMiddleware({ debug: true })],
        }),
      }),
    rateMessageUpdateTrace: makeRateMessageUpdateTrace({
      llmAsAJudge: llmAsAJudgeConfig,
      segment: segmentConfig,
      scrubbedMessageStore,
      braintrustLogger,
    }),
    commentMessageUpdateTrace: makeCommentMessageUpdateTrace({
      openAiClient: braintrustOpenAi,
      judgeLlm: preprocessorModel,
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
    generateResponse: makeGenerateResponse({
      responseWithSearchToolStream: addMessageToConversationStream,
      verifiedAnswerStream: addMessageToConversationVerifiedAnswerStream,
    }),
    maxUserMessagesInConversation: 50,
    maxUserCommentLength: 500,
    conversations,
    maxInputLengthCharacters: 3000,
    braintrustLogger,
  },
  responsesRouterConfig: {
    createResponse: {
      conversations,
      generateResponse: makeGenerateResponse({
        responseWithSearchToolStream: responsesApiStream,
        verifiedAnswerStream: responsesVerifiedAnswerStream,
      }),
      supportedModels: ["mongodb-chat-latest"],
      maxOutputTokens: 4000,
      maxUserMessagesInConversation: 6,
      alwaysAllowedMetadataKeys: ["ip", "origin", "userAgent"],
    },
  },
  maxRequestTimeoutMs: 60000,
  corsOptions: makeCorsOptions(isProduction, allowedOrigins),
  expressAppConfig: !isProduction
    ? async (app) => {
        const staticAssetsPath = path.join(__dirname, "..", "static");
        app.use(express.static(staticAssetsPath));
      }
    : undefined,
};
