import { stripIndents } from "common-tags";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { ObjectId, EmbeddedContent, FunctionDefinition } from "chat-core";
import { Message, conversationConstants } from "../../services/conversations";
import { OpenAiChatMessage, OpenAiMessageRole } from "../../services/ChatLlm";
import {
  ConversationForApi,
  ApiMessage,
  convertMessageFromDbToApi,
  isValidIp,
} from "./utils";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { z } from "zod";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";
import { FindContentFunc } from "./FindContentFunc";
import {
  ApiConversationsService,
  ApiConversation,
} from "../../services/ApiConversations";
import { ApiChatLlm } from "../../services/ApiChatLlm";

export const MAX_INPUT_LENGTH = 300; // magic number for max input size for LLM
export const MAX_MESSAGES_IN_CONVERSATION = 100; // magic number for max messages in a conversation

// SKUNK_TODO: get project, org and cluster Ids from the user input
/**
 * The API credentials are a map of API names to API keys and secrets.
 * e.g.
 * {
 *   "atlas-admin-api": {
 *     publicKey: "<Public Key>",
 *     privateKey: "<Private Key>",
 *   }
 * }
 */
export type ApiCredentials = z.infer<typeof ApiCredentials>;
export const ApiCredentials = z.record(z.record(z.string()));

export type AddApiMessageRequestBody = z.infer<typeof AddApiMessageRequestBody>;
export const AddApiMessageRequestBody = z.object({
  message: z.string(),
  apiCredentials: ApiCredentials,
});

export const AddApiMessageRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    params: z.object({
      conversationId: z.string(),
    }),
    query: z.object({
      // stream: z.string().optional(), // TODO - out of scope for skunkworks
    }),
    body: AddApiMessageRequestBody,
    ip: z.string(),
  })
);

export type AddApiMessageRequest = z.infer<typeof AddApiMessageRequest>;

export interface AddApiMessageRouteParams {
  conversations: ApiConversationsService;
  llm: ApiChatLlm;
  maxChunkContextTokens?: number;
  findContent: FindContentFunc;
}

export type RequestError = Error & {
  name: "RequestError";
  httpStatus: number;
};

export const makeRequestError = ({
  message,
  httpStatus,
  stack: stackIn,
}: Omit<RequestError, "name">): RequestError => {
  const stack = stackIn ?? new Error(message).stack;
  return {
    stack,
    message,
    httpStatus,
    name: "RequestError",
  };
};

export function makeAddApiMessageRoute({
  conversations,
  llm,
}: AddApiMessageRouteParams) {
  return async (
    req: ExpressRequest<AddApiMessageRequest["params"]>,
    res: ExpressResponse<ApiMessage>
  ) => {
    const reqId = getRequestId(req);
    try {
      const {
        params: { conversationId: conversationIdString },
        body: { message, apiCredentials },
        query: { stream },
        ip,
      } = req;
      logRequest({
        reqId,
        message: stripIndents`Request info:
          User message: ${message}
          Stream: ${stream}
          IP: ${ip}
          ConversationId: ${conversationIdString}`,
      });

      if (!isValidIp(ip)) {
        throw makeRequestError({
          httpStatus: 400,
          message: `Invalid IP address ${ip}`,
        });
      }

      const latestMessageText = message;

      if (latestMessageText.length > MAX_INPUT_LENGTH) {
        throw makeRequestError({
          httpStatus: 400,
          message: "Message too long",
        });
      }

      // --- LOAD CONVERSATION ---
      const conversation = await loadConversation({
        conversationIdString,
        conversations,
      });

      // --- MAX CONVERSATION LENGTH CHECK ---
      if (conversation.messages.length >= MAX_MESSAGES_IN_CONVERSATION) {
        // Omit the system prompt and assume the user always received one response per message
        const maxUserMessages = (MAX_MESSAGES_IN_CONVERSATION - 1) / 2;
        throw makeRequestError({
          httpStatus: 400,
          message: `Too many messages. You cannot send more than ${maxUserMessages} messages in this conversation.`,
        });
      }

      // --- PREPROCESS ---
      // TODO - User query preprocessing is out of scope for skunkworks
      const query = latestMessageText;

      const latestMessage = {
        content: query,
        role: "user",
      } satisfies OpenAiChatMessage;
      logRequest({
        reqId,
        message: `Latest message sent to LLM: ${JSON.stringify(latestMessage)}`,
      });

      // --- GENERATE RESPONSE ---
      // TODO - get the available functions from the database
      const answerContent = await (async () => {
        try {
          const messages = [
            ...conversation.messages.map(convertDbMessageToOpenAiMessage),
            // latestMessage,
          ] satisfies OpenAiChatMessage[];
          logRequest({
            reqId,
            message: `LLM query: ${JSON.stringify(messages)}`,
          });
          // --- GENERATE RESPONSE ---
          // TODO - this is where the skunk magic happens
          //  - call the LLM
          const { newMessages } = await llm.answerAwaited({
            query,
            messages,
            staticHttpRequestArgs: {
              pathParameters: {
                orgId: "hello",
                projectId: "hi",
                clusterId: "hey",
              },
            },
            apiCredentials: {
              type: "digest",
              username: apiCredentials.username,
              password: apiCredentials.password,
            },
          });
          // TODO: (ben's not sure)
          // ---
          // user: make me a cluster
          // assistant: find openapi spec action
          // function: hey i found it it + actually adds the function (we make this message)
          let lastMessage = newMessages[newMessages.length - 1];
          while (lastMessage.role === "function") {
            // keep executing llm.answerAwaited until we get a message that is not a function
            //
          }
          // ---
          // logRequest({
          //   reqId,
          //   message: `LLM response: ${JSON.stringify(answer)}`,
          // });
          // TODO - save the newMessages & availableFunctionDefinitions to the database
          // TODO: Add all the new messages to the DB
          const latestAssistantMessage = newMessages
            .slice()
            .reverse()
            .find((m) => m.role === "assistant");
          return latestAssistantMessage?.content ?? "";
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : JSON.stringify(err);
          logRequest({
            reqId: req.headers["req-id"] as string,
            message: `LLM error: ${errorMessage}`,
            type: "error",
          });
          logRequest({
            reqId,
            message: "Only sending vector search results to user",
          });
          const answer = {
            role: "assistant",
            content: conversationConstants.LLM_NOT_WORKING,
          } satisfies OpenAiChatMessage;
          return answer.content;
        }
      })();

      if (!answerContent) {
        throw makeRequestError({
          httpStatus: 500,
          message: "No answer content",
        });
      }

      // --- SAVE QUESTION(s) & RESPONSE ---
      const { assistantMessage } = await addMessagesToDatabase({
        conversations,
        conversation,
        originalUserMessageContent: message,
        assistantMessageContent: answerContent,
      });

      const apiRes = convertMessageFromDbToApi(assistantMessage);
      return res.status(200).json(apiRes);
    } catch (error) {
      const { httpStatus, message } =
        (error as Error).name === "RequestError"
          ? (error as RequestError)
          : makeRequestError({
              message: (error as Error).message,
              stack: (error as Error).stack,
              httpStatus: 500,
            });
      sendErrorResponse({
        res,
        reqId,
        httpStatus,
        errorMessage: message,
      });
    }
  };
}

export async function sendStaticNonResponse({
  conversations,
  conversation,
  latestMessageText,
  res,
}: {
  conversations: ApiConversationsService;
  conversation: ApiConversation;
  latestMessageText: string;
  res: ExpressResponse<ApiMessage>;
}) {
  const { assistantMessage } = await addMessagesToDatabase({
    conversations,
    conversation,
    originalUserMessageContent: latestMessageText,
    assistantMessageContent: conversationConstants.NO_RELEVANT_CONTENT,
  });
  const apiRes = convertMessageFromDbToApi(assistantMessage);
  return res.status(200).json(apiRes);
}

export function convertDbMessageToOpenAiMessage(
  message: Message
): OpenAiChatMessage {
  return {
    content: message.content,
    role: message.role as OpenAiMessageRole,
  };
}

interface AddMessagesToDatabaseParams {
  conversation: ApiConversation;
  originalUserMessageContent: string;
  preprocessedUserMessageContent?: string;
  assistantMessageContent: string;
  conversations: ApiConversationsService;
}

export async function addMessagesToDatabase({
  conversation,
  originalUserMessageContent,
  assistantMessageContent,
  conversations,
}: AddMessagesToDatabaseParams) {
  // TODO: consider refactoring addConversationMessage to take in an array of messages.
  // Would limit database calls.
  const conversationId = conversation._id;
  const userMessage = await conversations.addApiConversationMessage({
    conversationId,
    message: {
      content: originalUserMessageContent,
      role: "user",
    },
    newSystemPrompt: undefined,
  });
  const assistantMessage = await conversations.addApiConversationMessage({
    conversationId,
    message: {
      content: assistantMessageContent,
      role: "assistant",
    },
    newSystemPrompt: undefined,
  });
  return { userMessage, assistantMessage };
}

const loadConversation = async ({
  conversationIdString,
  conversations,
}: {
  conversationIdString: string;
  conversations: ApiConversationsService;
}) => {
  const conversationId = toObjectId(conversationIdString);
  const conversation = await conversations.findById({
    _id: conversationId,
  });
  if (!conversation) {
    throw makeRequestError({
      httpStatus: 404,
      message: `Conversation ${conversationId} not found`,
    });
  }
  return conversation;
};

const toObjectId = (id: string) => {
  try {
    return new ObjectId(id);
  } catch (error) {
    throw makeRequestError({
      httpStatus: 400,
      message: `Invalid ObjectId string: ${id}`,
    });
  }
};
