import { Request, Router, RequestHandler } from "express";
import { rateLimit, Options as RateLimitOptions } from "express-rate-limit";
import slowDown, { Options as SlowDownOptions } from "express-slow-down";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import { ChatLlm } from "../../services/ChatLlm";
import { Conversation } from "../../services/conversations";
import { DataStreamer } from "../../services/dataStreamer";
import { ConversationCustomData, ConversationsService } from "../../services/conversations";
import { RateMessageRequest, makeRateMessageRoute } from "./rateMessage";
import {
  CreateConversationRequest,
  makeCreateConversationRoute,
} from "./createConversation";
import {
  AddMessageRequest,
  MakeReferenceLinksFunc,
  makeAddMessageToConversationRoute,
} from "./addMessageToConversation";
import { QueryPreprocessorFunc } from "../../processors/QueryPreprocessorFunc";
import { FindContentFunc } from "./FindContentFunc";
import { requireRequestOrigin } from "../../middleware/requestOrigin";

/**
  Configuration for rate limiting on the /conversations/* routes.
 */
export interface ConversationsRateLimitConfig {
  /**
    Configuration for rate limiting on ALL /conversations/* routes.
   */
  routerRateLimitConfig?: Partial<RateLimitOptions>;

  /**
    Configuration for rate limiting on the POST /conversations/:conversationId/messages route.
    Since this is the most "expensive" route as it calls the LLM,
    it could be more restrictive than the global rate limit.
   */
  addMessageRateLimitConfig?: Partial<RateLimitOptions>;

  /**
    Configuration for slow down on ALL /conversations/* routes.
   */
  routerSlowDownConfig?: Partial<SlowDownOptions>;

  /**
    Configuration for slow down on the POST /conversations/:conversationId/messages route.
    Since this is the most "expensive" route as it calls the LLM,
    it could be more restrictive than the global slow down.
   */
  addMessageSlowDownConfig?: Partial<SlowDownOptions>;
}

export type AddCustomDataFunc = (request: Request) => Promise<ConversationCustomData>;

/**
  Configuration for the /conversations/* routes.
 */
export interface ConversationsRouterParams {
  llm: ChatLlm;
  dataStreamer: DataStreamer;
  conversations: ConversationsService;
  userQueryPreprocessor?: QueryPreprocessorFunc;
  /**
    Maximum number of tokens of context to send to the LLM in retrieval augmented generation
    in addition to system prompt, other user messages, etc.
   */
  maxChunkContextTokens?: number;

  /**
    Maximum number of characters in user input.
    Server returns 400 error if user input is longer than this.
   */
  maxInputLengthCharacters?: number;

  /**
    Maximum number of messages in a conversation.
    Server returns 400 error if user tries to add a message to a conversation
    that has this many messages.
   */
  maxMessagesInConversation?: number;
  rateLimitConfig?: ConversationsRateLimitConfig;
  findContent: FindContentFunc;
  makeReferenceLinks?: MakeReferenceLinksFunc;
  /**
    Middleware to put in front of all the routes in the conversationsRouter.
    You can use this to do things like authentication, data validation, etc.
   */
  middleware?: RequestHandler[];
  /**
    Function that takes the request and returns any custom data you want to include
    in the Conversation. For example, you might want to store the user's email address
    with the conversation.
    The custom data is persisted to the database with the Conversation in the
    {@link Conversation.customData} field.

   */
  addCustomData?: AddCustomDataFunc;
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
/**
  Constructor function to make the /conversations/* Express.js router.
 */
export function makeConversationsRouter({
  llm,
  dataStreamer,
  conversations,
  userQueryPreprocessor,
  maxChunkContextTokens,
  maxInputLengthCharacters,
  maxMessagesInConversation,
  rateLimitConfig,
  findContent,
  makeReferenceLinks,
  middleware,
  addCustomData,
}: ConversationsRouterParams) {
  const conversationsRouter = Router();

  // Add middleware to the conversationsRouter.
  middleware?.forEach((middleware) => conversationsRouter.use(middleware));

  /*
    Global rate limit the requests to the conversationsRouter.
   */
  const globalRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5000,
    standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: true, // X-RateLimit-* headers
    message: rateLimitResponse,
    keyGenerator,
    ...(rateLimitConfig?.routerRateLimitConfig ?? {}),
  });
  conversationsRouter.use(globalRateLimit);
  /*
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

  // Create new conversation.
  conversationsRouter.post(
    "/",
    requireRequestOrigin(),
    validateRequestSchema(CreateConversationRequest),
    makeCreateConversationRoute({ conversations, addCustomData })
  );

  /*
    Rate limit the requests to the addMessageToConversationRoute.
    Rate limit should be more restrictive than global rate limiter to limit expensive requests to the LLM.
   */
  const addMessageRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 2500,
    standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
    legacyHeaders: true, // X-RateLimit-* headers
    message: rateLimitResponse,
    keyGenerator,
    ...(rateLimitConfig?.addMessageRateLimitConfig ?? {}),
  });
  /*
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

  /*
    Create a new message from the user and get response from the LLM.
   */
  const addMessageToConversationRoute = makeAddMessageToConversationRoute({
    conversations,
    llm,
    dataStreamer,
    userQueryPreprocessor,
    maxChunkContextTokens,
    maxInputLengthCharacters,
    maxMessagesInConversation,
    findContent,
    makeReferenceLinks,
  });
  conversationsRouter.post(
    "/:conversationId/messages",
    addMessageRateLimit,
    addMessageSlowDown,
    requireRequestOrigin(),
    validateRequestSchema(AddMessageRequest),
    addMessageToConversationRoute
  );

  // Rate a message.
  conversationsRouter.post(
    "/:conversationId/messages/:messageId/rating",
    validateRequestSchema(RateMessageRequest),
    makeRateMessageRoute({ conversations })
  );

  return conversationsRouter;
}
