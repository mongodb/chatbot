import { Request, Router } from "express";
import { EmbedFunc, FindNearestNeighborsOptions } from "chat-core";
import { rateLimit, Options as RateLimitOptions } from "express-rate-limit";
import slowDown, { Options as SlowDownOptions } from "express-slow-down";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import { ChatLlm } from "../../services/ChatLlm";
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

export interface ConversationsRateLimitConfig {
  routerRateLimitConfig?: Partial<RateLimitOptions>;
  addMessageRateLimitConfig?: Partial<RateLimitOptions>;
  routerSlowDownConfig?: Partial<SlowDownOptions>;
  addMessageSlowDownConfig?: Partial<SlowDownOptions>;
}

export interface ConversationsRouterParams {
  llm: ChatLlm;
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

export const rateLimitResponse = {
  error: "Too many requests, please try again later.",
};

function keyGenerator(request: Request) {
  if (!request.ip) {
    throw new Error("Request IP is not defined");
  }

  return request.ip;
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
  rateLimitConfig,
}: ConversationsRouterParams<OpenAiStreamingResponse, OpenAiAwaitedResponse>) {
  const conversationsRouter = Router();

  /**
    Global rate limit the requests to the conversationsRouter.
   */
  const globalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: true, // X-RateLimit-* headers
    message: rateLimitResponse,
    keyGenerator,
    ...(rateLimitConfig?.routerRateLimitConfig ?? {}),
  });
  conversationsRouter.use(globalRateLimit);
  /**
    Slow down the response to the conversationsRouter after certain number
    of requests in the time window.
   */
  const globalSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 20,
    delayMs: 500,
    keyGenerator,
    ...(rateLimitConfig?.routerSlowDownConfig ?? {}),
  });
  conversationsRouter.use(globalSlowDown);

  /**
   * Create new conversation.
   */
  conversationsRouter.post(
    "/",
    validateRequestSchema(CreateConversationRequest),
    makeCreateConversationRoute({ conversations })
  );

  /**
    Rate limit the requests to the addMessageToConversationRoute.
    Rate limit should be more restrictive than global rate limiter to limit expensive requests to the LLM.
   */
  const addMessageRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: true, // X-RateLimit-* headers
    message: rateLimitResponse,
    keyGenerator,
    ...(rateLimitConfig?.addMessageRateLimitConfig ?? {}),
  });
  /**
    Slow down the response to the addMessageToConversationRoute after certain number
    of requests in the time window. Rate limit should be more restrictive than global slow down
    to limit expensive requests to the LLM.
   */
  const addMessageSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 10,
    delayMs: 1500,
    keyGenerator,
    ...(rateLimitConfig?.addMessageSlowDownConfig ?? {}),
  });
  /**
   * Create a new message from the user and get response from the LLM.
   */
  conversationsRouter.post(
    "/:conversationId/messages",
    addMessageRateLimit,
    addMessageSlowDown,
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
