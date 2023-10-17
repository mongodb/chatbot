/**
  @fileoverview This file contains the configuration implementation for the chat server,
  which is run from `index.ts`.
 */
import "dotenv/config";
import {
  EmbeddedContent,
  MongoClient,
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedFunc,
} from "chat-core";
import { makeMongoDbConversationsService } from "./services/conversations";
import { makeDataStreamer } from "./services/dataStreamer";
import { makeOpenAiChatLlm } from "./services/openAiChatLlm";
import { stripIndents } from "common-tags";
import { AppConfig } from "./app";
import { makeBoostOnAtlasSearchFilter } from "./processors/makeBoostOnAtlasSearchFilter";
import { CORE_ENV_VARS, assertEnvVars } from "chat-core";
import { makePreprocessMongoDbUserQuery } from "./processors/makePreprocessMongoDbUserQuery";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { OpenAiChatMessage, SystemPrompt } from "./services/ChatLlm";
import { makeDefaultFindContentFunc } from "./routes/conversations/FindContentFunc";
import { makeDefaultReferenceLinks } from "./routes/conversations/addMessageToConversation";

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

export const dataStreamer = makeDataStreamer();

export const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

export const embed = makeOpenAiEmbedFunc({
  openAiClient,
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});

export const mongodb = new MongoClient(MONGODB_CONNECTION_URI);

export const findContent = makeDefaultFindContentFunc({
  embed,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  },
  searchBoosters: [boostManual],
});

export const conversations = makeMongoDbConversationsService(
  mongodb.db(MONGODB_DATABASE_NAME),
  systemPrompt
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
  return baseReferences.map((ref) => {
    const url = new URL(ref.url);
    return {
      url: url.href,
      title: url.origin + url.pathname,
    };
  });
}

export const config: AppConfig = {
  conversationsRouterConfig: {
    dataStreamer,
    llm,
    findContent,
    userQueryPreprocessor: mongoDbUserQueryPreprocessor,
    maxChunkContextTokens: 1500,
    conversations,
    makeReferenceLinks: makeMongoDbReferences,
  },
  maxRequestTimeoutMs: 30000,
  corsOptions: {
    origin: allowedOrigins,
  },
};
