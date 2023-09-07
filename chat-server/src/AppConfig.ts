import { MakeOpenAiChatLlmParams } from "./services/openAiChatLlm";
import { SearchBooster } from "./processors/SearchBooster";
import { MakeDatabaseConnectionParams } from "chat-core";
export type LlmConfig = MakeOpenAiChatLlmParams;
import {
  MakeOpenAiEmbedFuncArgs,
  FindNearestNeighborsOptions,
} from "chat-core";
import { QueryPreprocessorFunc } from "./processors/QueryPreprocessorFunc";
import { CorsOptions } from "cors";
import { ConversationsRateLimitConfig } from "./routes/conversations/conversationsRouter";

export type EmbedConfig = MakeOpenAiEmbedFuncArgs;

export type FindNearestNeighborsOptionsConfig = Omit<
  FindNearestNeighborsOptions,
  "filter"
> & {
  filter?: FindNearestNeighborsOptions["filter"];
};

export type EmbeddedContentStoreConfig = MakeDatabaseConnectionParams;

// TODO: refactor have this type come from chat-core when the MongoDb class is
// refactored to a function following make pattern. Alternatively, we could likely
// remove MongoDb as a direct dependency and include it in the make conversation service
// and make embedded content store functions.
export interface MongoDbConfig {
  connectionUri: string;
  databaseName: string;
  vectorSearchIndexName: string;
}

export interface AppConfig {
  llm: LlmConfig;
  conversations: {
    searchBoosters?: SearchBooster[];
    userQueryPreprocessor?: QueryPreprocessorFunc;
    maxChunkContextTokens?: number;
    rateLimitConfig?: ConversationsRateLimitConfig;
  };
  findNearestNeighborsOptions: FindNearestNeighborsOptionsConfig;
  embeddedContentStore: EmbeddedContentStoreConfig;
  mongodb: MongoDbConfig;
  embed: EmbedConfig;
  maxRequestTimeoutMs?: number;
  corsOptions?: CorsOptions;
}
