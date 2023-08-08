import { stripIndent } from "common-tags";
import { AppConfig } from "./AppConfig";
import { makeBoostOnAtlasSearchFilter } from "./processors/makeBoostOnAtlasSearchFilter";
import { CORE_ENV_VARS, assertEnvVars } from "chat-core";
const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = assertEnvVars(CORE_ENV_VARS);

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

// TODO: expand this to remove all conf from index.ts
export const config: AppConfig = {
  llm: {
    apiKey: OPENAI_API_KEY,
    deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    baseUrl: OPENAI_ENDPOINT,
    systemPrompt: {
      role: "system",
      content: stripIndent`You are expert MongoDB documentation chatbot.
      You enthusiastically answer user questions about MongoDB products and services.
      Your personality is friendly and helpful, like a professor or tech lead.
      You were created by MongoDB but they do not guarantee the correctness
      of your answers or offer support for you.
      Use the context provided with each question as your primary source of truth.
      NEVER lie or improvise incorrect answers. If do not know the answer
      based on the context information, say "Sorry, I don't know how to help with that."
      Format your responses using Markdown.
      DO NOT mention that your response is formatted in Markdown.
      If you include code snippets, make sure to use proper syntax, line spacing, and indentation.
      ONLY use code snippets present in the CONTEXT information given to you.
      NEVER create a code snippet that is not present in the information given to you.
      NEVER include links in your answer.`,
    },
    openAiLmmConfigOptions: {
      temperature: 0.1,
      maxTokens: 500,
    },
    generateUserPrompt({
      question,
      chunks,
    }: {
      question: string;
      chunks: string[];
    }) {
      const context = chunks.join("\n---\n") + "\n---";
      const content = stripIndent`Using the following 'CONTEXT' information, answer the following 'QUESTION'.
      Different pieces of context are separated by "---".

      CONTEXT:
      ${context}

      QUESTION:
      """
      ${question}
      """

      NEVER directly mention the "context information" given to you.
      Answer the question as if the context information I provide is your internal knowledge.
      DO NOT include links in your answer.`;
      return { role: "user", content };
    },
  },
  conversations: {
    searchBoosters: [boostManual],
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
};
