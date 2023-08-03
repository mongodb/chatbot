import { GetChatCompletionsOptions } from "@azure/openai";
import { OpenAiChatMessage, WithScore, EmbeddedContent } from "chat-core";

export interface AppConfig {
  llm: LlmConfig;
  conversations?: {
    searchBoosters?: SearchBooster[];
  };
}

export interface LlmConfig {
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
