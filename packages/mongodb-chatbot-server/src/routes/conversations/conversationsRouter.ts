import { Request, RequestHandler, Response } from "express";
import Router from "express-promise-router";
import { rateLimit, Options as RateLimitOptions } from "express-rate-limit";
import slowDown, { Options as SlowDownOptions } from "express-slow-down";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import {
  ChatLlm,
  SystemPrompt,
  ConversationCustomData,
  ConversationsService,
} from "mongodb-rag-core";
import {
  CommentMessageRequest,
  makeCommentMessageRoute,
} from "./commentMessage";
import { RateMessageRequest, makeRateMessageRoute } from "./rateMessage";
import {
  CreateConversationRequest,
  makeCreateConversationRoute,
} from "./createConversation";
import {
  AddMessageRequest,
  AddMessageToConversationRouteParams,
  makeAddMessageToConversationRoute,
} from "./addMessageToConversation";
import { requireRequestOrigin } from "../../middleware/requireRequestOrigin";
import { NextFunction, ParamsDictionary } from "express-serve-static-core";
import { requireValidIpAddress } from "../../middleware";
import {
  FilterPreviousMessages,
  GenerateUserPromptFunc,
} from "../../processors";
import {
  GetConversationRequest,
  makeGetConversationRoute,
} from "./getConversation";
import { UpdateTraceFunc } from "./UpdateTraceFunc";

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

/**
  Function to add custom data to the {@link Conversation} persisted to the database.
  Has access to the Express.js request and response plus the {@link ConversationsRouterLocals}
  from the {@link Response.locals} object.
 */
export type AddCustomDataFunc = (
  request: Request,
  response: ConversationsRouterResponse
) => Promise<ConversationCustomData>;

/**
  Express.js Request that exposes the app's {@link ConversationsService}.

  This is useful if you want to do authentication or dynamic data validation.
 */
export interface ConversationsRouterLocals {
  conversations: ConversationsService;
  customData: Record<string, unknown>;
}

/**
  Express.js Response from the app's {@link ConversationsService}.
 */
export type ConversationsRouterResponse = Response<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ConversationsRouterLocals
>;

/**
  Middleware to put in front of all the routes in the conversationsRouter.
  This middleware is useful for things like authentication, data validation, etc.
  It exposes the app's {@link ConversationsService}.
  It also lets you access {@link ConversationsRouterLocals} via {@link Response.locals}
  ([docs](https://expressjs.com/en/api.html#res.locals)).
  You can use the locals in other middleware or persist when you create the conversation
  with the `POST /conversations` endpoint with the {@link AddCustomDataFunc}.
 */
export type ConversationsMiddleware = RequestHandler<
  ParamsDictionary,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ConversationsRouterLocals
>;

/**
  Configuration for the /conversations/* routes.
 */
export interface ConversationsRouterParams {
  llm: ChatLlm;
  conversations: ConversationsService;
  systemPrompt: SystemPrompt;

  /**
    Function to generate the user prompt sent to the {@link ChatLlm}.
    You can perform any preprocessing of the user's message
    including retrieval augmented generation here.
   */
  generateUserPrompt?: GenerateUserPromptFunc;

  /**
    Maximum number of characters in user input.
    Server returns 400 error if user input is longer than this.
   */
  maxInputLengthCharacters?: number;

  /**
    Function to filter which previous messages are sent to the {@link ChatLlm}.
    For example, you may only want to send the system prompt to the LLM
    with the user message or the system prompt and X prior messages.
    Defaults to sending only the system prompt.
   */
  filterPreviousMessages?: FilterPreviousMessages;

  /**
    Maximum number of user-sent messages in a conversation.
    Server returns 400 error if user tries to add a message to a conversation
    that has this many messages.
   */
  maxUserMessagesInConversation?: number;
  rateLimitConfig?: ConversationsRateLimitConfig;

  /**
    Middleware to put in front of all the routes in the conversationsRouter.
    You can use this to do things like authentication, data validation, etc.

    If you want the middleware to run only on certain routes,
    you can add conditional logic inside the middleware. For example:

    ```ts
    const someMiddleware: ConversationsMiddleware = (req, res, next) => {
      if (req.path === "/conversations") {
        // Do something
      }
      next();
    }
    ```

   */
  middleware?: ConversationsMiddleware[];

  /**
    Function that takes the request + response and returns any custom data you want to include
    in the {@link Conversation} persisted to the database.
    For example, you might want to store the user's email address with the conversation.
    The custom data is persisted to the database with the Conversation in the
    {@link Conversation.customData} field.
   */
  createConversationCustomData?: AddCustomDataFunc;

  /**
    Function that takes the request + response and returns any custom data you want to include
    in the {@link Message} persisted to the database.
    For example, you might want to store details about what LLM was used to generate the response.
    The custom data is persisted to the database with the `Message` in the
    {@link Message.customData} field inside of the {@link Conversation.messages} array.
   */
  addMessageToConversationCustomData?: AddCustomDataFunc;

  addMessageToConversationUpdateTrace?: AddMessageToConversationRouteParams["updateTrace"];

  rateMessageUpdateTrace?: UpdateTraceFunc;
  commentMessageUpdateTrace?: UpdateTraceFunc;

  /**
    Maximum number of characters allowed in a user's comment on an assistant {@link Message}.
    If not specified, user comments may be of any length.
   */
  maxUserCommentLength?: number;

  /**
    Whether to create a new conversation if the message ID is "null"
    on the addMessageToConversation route.

    @default true
   */
  createConversationOnNullMessageId?: boolean;
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

const addIpToCustomData: AddCustomDataFunc = async (req) =>
  req.ip
    ? {
        ip: req.ip,
      }
    : undefined;

const addOriginToCustomData: AddCustomDataFunc = async (_, res) =>
  res.locals.customData.origin
    ? {
        origin: res.locals.customData.origin,
      }
    : undefined;

const addUserAgentToCustomData: AddCustomDataFunc = async (req) =>
  req.headers["user-agent"]
    ? {
        userAgent: req.headers["user-agent"],
      }
    : undefined;

export type AddDefinedCustomDataFunc = (
  ...args: Parameters<AddCustomDataFunc>
) => Promise<Exclude<ConversationCustomData, undefined>>;

export const defaultCreateConversationCustomData: AddDefinedCustomDataFunc =
  async (req, res) => {
    return {
      ...(await addIpToCustomData(req, res)),
      ...(await addOriginToCustomData(req, res)),
      ...(await addUserAgentToCustomData(req, res)),
    };
  };

export const defaultAddMessageToConversationCustomData: AddDefinedCustomDataFunc =
  async (req, res) => {
    return {
      ...(await addIpToCustomData(req, res)),
      ...(await addOriginToCustomData(req, res)),
      ...(await addUserAgentToCustomData(req, res)),
    };
  };

/**
  Constructor function to make the /conversations/* Express.js router.
 */
export function makeConversationsRouter({
  llm,
  conversations,
  systemPrompt,
  maxInputLengthCharacters,
  maxUserMessagesInConversation,
  filterPreviousMessages,
  rateLimitConfig,
  generateUserPrompt,
  middleware = [requireValidIpAddress(), requireRequestOrigin()],
  createConversationCustomData = defaultCreateConversationCustomData,
  addMessageToConversationCustomData = defaultAddMessageToConversationCustomData,
  addMessageToConversationUpdateTrace,
  rateMessageUpdateTrace,
  commentMessageUpdateTrace,
  maxUserCommentLength,
  createConversationOnNullMessageId = true,
}: ConversationsRouterParams) {
  const conversationsRouter = Router();
  // Set the customData and conversations on the response locals
  // for use in subsequent middleware.
  conversationsRouter.use(((_, res: Response, next: NextFunction) => {
    res.locals.conversations = conversations;
    res.locals.customData = {};
    next();
  }) satisfies RequestHandler);

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
    validateRequestSchema(CreateConversationRequest),
    makeCreateConversationRoute({
      conversations,
      createConversationCustomData,
      systemPrompt,
    })
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
    maxInputLengthCharacters,
    maxUserMessagesInConversation,
    addMessageToConversationCustomData,
    generateUserPrompt,
    filterPreviousMessages,
    createConversation: createConversationOnNullMessageId
      ? {
          createOnNullConversationId: createConversationOnNullMessageId,
          addCustomData: createConversationCustomData,
          systemMessage: systemPrompt,
        }
      : undefined,
    updateTrace: addMessageToConversationUpdateTrace,
  });
  conversationsRouter.post(
    "/:conversationId/messages",
    addMessageRateLimit,
    addMessageSlowDown,
    validateRequestSchema(AddMessageRequest),
    addMessageToConversationRoute
  );

  // Get conversations by conversation ID.
  conversationsRouter.get(
    "/:conversationId",
    validateRequestSchema(GetConversationRequest),
    makeGetConversationRoute({ conversations })
  );

  // Rate a message.
  conversationsRouter.post(
    "/:conversationId/messages/:messageId/rating",
    validateRequestSchema(RateMessageRequest),
    makeRateMessageRoute({ conversations, updateTrace: rateMessageUpdateTrace })
  );

  // Comment on a message.
  conversationsRouter.post(
    "/:conversationId/messages/:messageId/comment",
    validateRequestSchema(CommentMessageRequest),
    makeCommentMessageRoute({
      conversations,
      maxCommentLength: maxUserCommentLength,
      updateTrace: commentMessageUpdateTrace,
    })
  );

  return conversationsRouter;
}
