import { stripIndents } from "common-tags";
import { AppConfig } from "./AppConfig";
import { makeBoostOnAtlasSearchFilter } from "./processors/makeBoostOnAtlasSearchFilter";
import { CORE_ENV_VARS, assertEnvVars } from "chat-core";
import { makePreprocessMongoDbUserQuery } from "./processors/makePreprocessMongoDbUserQuery";
const {
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
  shouldBoostFunc({ text }: { text: string }) {
    return text.split(" ").filter((s) => s !== " ").length <= 3;
  },
  findNearestNeighborsOptions: {
    filter: {
      text: {
        path: "sourceName",
        query: "snooty-docs",
      },
    },
    k: 3,
    minScore: 0.88,
  },
  totalMaxK: 5,
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

// TODO: expand this to remove all conf from index.ts
export const config: AppConfig = {
  llm: {
    apiKey: OPENAI_API_KEY,
    deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    baseUrl: OPENAI_ENDPOINT,
    systemPrompt: {
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
      ONLY use code snippets present in the <CONTEXT> information given to you.
      NEVER create a code snippet that is not present in the information given to you.
      You ONLY know about the current version of MongoDB products. Versions are provided in the <CONTEXT> information. If \`version: null\`, then say that the product is unversioned.
      Never directly mention "<CONTEXT>" or "<QUESTION>" in your answer.
      Instead, refer to the <CONTEXT> information as "my knowledge".`,
    },
    openAiLmmConfigOptions: {
      temperature: 0,
      maxTokens: 500,
    },
    generateUserPrompt({
      question,
      chunks,
    }: {
      question: string;
      chunks: string[];
    }) {
      const chunkSeparator = "~~~~~~";
      const context = chunks.join(`\n${chunkSeparator}\n`);
      const content = stripIndents`Using the following context information, answer the question.
      Different pieces of information are separated by "${chunkSeparator}".

      <CONTEXT>
      ${context}
      <END CONTEXT>

      <QUESTION>
      ${question}
      <END QUESTION>`;
      return { role: "user", content };
    },
  },
  conversations: {
    searchBoosters: [boostManual],
    userQueryPreprocessor: mongoDbUserQueryPreprocessor,
    maxChunkContextTokens: 1500,
  },
  findNearestNeighborsOptions: {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  },
  embed: {
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
    baseUrl: OPENAI_ENDPOINT,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
    backoffOptions: {
      numOfAttempts: 3,
      maxDelay: 5000,
    },
  },
  embeddedContentStore: {
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  },
  mongodb: {
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
    vectorSearchIndexName: VECTOR_SEARCH_INDEX_NAME,
  },
  maxRequestTimeoutMs: 30000,
  corsOptions: {
    origin: allowedOrigins,
  },
};
