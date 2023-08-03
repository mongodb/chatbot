import { GetChatCompletionsOptions } from "@azure/openai";
import {
  OpenAiChatMessage,
  WithScore,
  EmbeddedContent,
  EmbeddedContentStore,
} from "chat-core";

export interface LlmConfig {
  apiKey: string;
  deployment: string;
  baseUrl: string;
  systemPrompt: OpenAiChatMessage & { role: "system" };
  openAiLmmConfigOptions: GetChatCompletionsOptions;
  generateUserPrompt: ({
    question,
    chunks,
  }: {
    question: string;
    chunks: string[];
  }) => OpenAiChatMessage & { role: "user" };
}

export interface EmbedConfig {
  apiKey: string;
  apiVersion: string;
  baseUrl: string;
  deployment: string;
}

export interface FindNearestNeighborsOptions {
  k: number;
  path: string;
  indexName: string;
  minScore: number;
}

export interface EmbeddedContentStoreConfig {
  connectionUri: string;
  databaseName: string;
}

export interface MongoDbConfig {
  connectionUri: string;
  databaseName: string;
  vectorSearchIndexName: string;
}

export interface SearchBooster {
  shouldBoost: ({ text }: { text: string }) => boolean;
  boost: ({
    existingResults,
    embedding,
    store,
  }: {
    embedding: number[];
    existingResults: WithScore<EmbeddedContent>[];
    store: EmbeddedContentStore;
  }) => Promise<WithScore<EmbeddedContent>[]>;
}

export interface AppConfig {
  llm: LlmConfig;
  conversations: {
    searchBoosters?: SearchBooster[];
  };
  findNearestNeighborsOptions: FindNearestNeighborsOptions;
  embeddedContentStore: EmbeddedContentStoreConfig;
  mongodb: MongoDbConfig;
  embed: EmbedConfig;
}
