/**
  @fileoverview This file contains the configuration implementation for the chat server,
  which is run from `index.ts`.
 */
import "dotenv/config";
import {
  EmbeddedContent,
  MongoClient,
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedder,
  makeMongoDbVerifiedAnswerStore,
} from "mongodb-rag-core";
import { makeMongoDbConversationsService } from "../services/mongodbConversations";
import { makeOpenAiChatLlm } from "../services/openAiChatLlm";
import { stripIndents } from "common-tags";
import { AppConfig } from "../app";
import { makeBoostOnAtlasSearchFilter } from "../processors/makeBoostOnAtlasSearchFilter";
import { CORE_ENV_VARS, assertEnvVars } from "mongodb-rag-core";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { SystemPrompt } from "../services/ChatLlm";
import { makePreprocessMongoDbUserQuery } from "./testPreProcessor/makePreprocessMongoDbUserQuery";
import {
  MakeUserMessageFunc,
  MakeUserMessageFuncParams,
  makeFilterNPreviousMessages,
  makeRagGenerateUserPrompt,
} from "../processors";
import { makeDefaultFindContent } from "../processors/makeDefaultFindContent";
import { makeDefaultReferenceLinks } from "../processors/makeDefaultReferenceLinks";
import { UserMessage } from "../services";

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

const VERIFIED_ANSWERS_CONNECTION_NAME =
  process.env.VERIFIED_ANSWERS_CONNECTION_NAME ?? "verified_answers";

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

export const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);

export const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

export const verifiedAnswerStore = makeMongoDbVerifiedAnswerStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  collectionName: VERIFIED_ANSWERS_CONNECTION_NAME,
});

export const embedder = makeOpenAiEmbedder({
  openAiClient,
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});

const mongoDbUserQueryPreprocessor = makePreprocessMongoDbUserQuery({
  azureOpenAiServiceConfig: {
    apiKey: OPENAI_API_KEY,
    baseUrl: OPENAI_ENDPOINT,
    deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    version: OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  },
  numRetries: 0,
  retryDelayMs: 5000,
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

export const generateUserPrompt = makeRagGenerateUserPrompt({
  findContent,
  queryPreprocessor: mongoDbUserQueryPreprocessor,
  makeReferenceLinks: makeMongoDbReferences,
  makeUserMessage,
});
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
    maxTokens: 500,
  },
});

export const mongodb = new MongoClient(MONGODB_CONNECTION_URI);

export const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME)
);

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

export const config: AppConfig = {
  conversationsRouterConfig: {
    llm,
    conversations,
    generateUserPrompt,
    filterPreviousMessages: filterPrevious12Messages,
    systemPrompt,
  },
  maxRequestTimeoutMs: 30000,
  corsOptions: {
    origin: allowedOrigins,
  },
};
