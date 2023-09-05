import { Router } from "express";
import { EmbedFunc, FindNearestNeighborsOptions } from "chat-core";
import {
  rateLimit,
  Options as RateLimitOptions,
  Store as RateLimitStore,
  MemoryStore,
} from "express-rate-limit";

import validateRequestSchema from "../../middleware/validateRequestSchema";
import {
  Llm,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "../../services/llm";
import { DataStreamer } from "../../services/dataStreamer";
import { ConversationsService } from "../../services/conversations";
import { EmbeddedContentStore } from "chat-core";
import { RateMessageRequest, makeRateMessageRoute } from "./rateMessage";
import {
  CreateConversationRequest,
  makeCreateConversationRoute,
} from "./createConversation";
import {
  AddMessageRequest,
  makeAddMessageToConversationRoute,
} from "./addMessageToConversation";
import { SearchBooster } from "../../processors/SearchBooster";
import { QueryPreprocessorFunc } from "../../processors/QueryPreprocessorFunc";

// TODO: for all non-2XX or 3XX responses, see how/if can better implement
// error handling. can/should we pass stuff to next() and process elsewhere?
export interface ConversationsRateLimitConfig {
  globalRateLimitConfig?: Partial<RateLimitOptions>;
  addMessageRateLimitConfig?: Partial<RateLimitOptions>;
  store?: RateLimitStore;
}

export interface ConversationsRouterParams<T, U> {
  llm: Llm<T, U>;
  embed: EmbedFunc;
  dataStreamer: DataStreamer;
  store: EmbeddedContentStore;
  conversations: ConversationsService;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
  searchBoosters?: SearchBooster[];
  userQueryPreprocessor?: QueryPreprocessorFunc;
  maxChunkContextTokens?: number;
  rateLimitConfig?: ConversationsRateLimitConfig;
}

export function makeConversationsRouter({
  llm,
  embed,
  dataStreamer,
  store,
  conversations,
  findNearestNeighborsOptions,
  searchBoosters,
  userQueryPreprocessor,
  maxChunkContextTokens,
  rateLimitConfig = {
    globalRateLimitConfig: {},
    addMessageRateLimitConfig: {},
  },
}: ConversationsRouterParams<OpenAiStreamingResponse, OpenAiAwaitedResponse>) {
  const conversationsRouter = Router();

  const globalRateLimit = rateLimit({
    ...rateLimitConfig?.globalRateLimitConfig,
    windowMs: rateLimitConfig?.globalRateLimitConfig?.windowMs ?? 60 * 1000, // Default: 1 minutes
    max: rateLimitConfig?.globalRateLimitConfig?.max ?? 100, // Default: Limit each IP to 100 requests per `window`
    standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: true, // X-RateLimit-* headers
    store: rateLimitConfig.store ?? new MemoryStore(),
  });

  const addMessageRateLimit = rateLimit({
    ...rateLimitConfig?.globalRateLimitConfig,
    windowMs: rateLimitConfig?.globalRateLimitConfig?.windowMs ?? 60 * 1000, // Default: 1 minutes
    max: rateLimitConfig?.globalRateLimitConfig?.max ?? 30, // Default: Limit each IP to 100 requests per `window`
    standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: true, // X-RateLimit-* headers
    store: rateLimitConfig.store ?? new MemoryStore(),
  });

  conversationsRouter.use(globalRateLimit);
  /**
   * Create new conversation.
   */
  conversationsRouter.post(
    "/",
    validateRequestSchema(CreateConversationRequest),
    makeCreateConversationRoute({ conversations })
  );

  /**
   * Create a new message from the user and get response from the LLM.
   */
  conversationsRouter.post(
    "/:conversationId/messages",
    addMessageRateLimit,
    validateRequestSchema(AddMessageRequest),
    makeAddMessageToConversationRoute({
      store,
      conversations,
      llm,
      dataStreamer,
      embed,
      findNearestNeighborsOptions,
      searchBoosters,
      userQueryPreprocessor,
      maxChunkContextTokens,
    })
  );

  /**
   * Rate a message.
   */
  conversationsRouter.post(
    "/:conversationId/messages/:messageId/rating",
    validateRequestSchema(RateMessageRequest),
    makeRateMessageRoute({ conversations })
  );

  return conversationsRouter;
}
