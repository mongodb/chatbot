import { stripIndents } from "common-tags";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { ObjectId, EmbeddedContent, FunctionDefinition } from "chat-core";
import { Message, conversationConstants } from "../../services/conversations";
import {
  OpenAiChatMessage,
  OpenAiMessageRole,
} from "../../services/ChatLlm";
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
export const MAX_MESSAGES_IN_CONVERSATION = 13; // magic number for max messages in a conversation

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

export type AddApiMessageRequestBody = z.infer<typeof AddMessageRequestBody>;
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
  findContent,
  maxChunkContextTokens = 1500,
}: AddApiMessageRouteParams) {
  return async (
    req: ExpressRequest<AddMessageRequest["params"]>,
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

      // --- VECTOR SEARCH / RETRIEVAL ---
      // This is where we look up relevant function reference docs chunks
      const { content, queryEmbedding } = await findContent({
        query,
        ipAddress: ip,
      });

      if (content.length === 0) {
        // The search didn't turn up any relevant API endpoints.
        logRequest({
          reqId,
          message: "No matching content found",
        });
        return await sendStaticNonResponse({
          conversations,
          conversation,
          latestMessageText,
          res,
        });
      }

      logRequest({
        reqId,
        message: stripIndents`Chunks found: ${JSON.stringify(
          content.map(
            ({ embedding, chunkAlgoHash, ...wantedProperties }) =>
              wantedProperties
          )
        )}`,
      });

      const chunkTexts = includeChunksForMaxTokensPossible({
        maxTokens: maxChunkContextTokens,
        content,
      }).map(({ text }) => text);

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
      const availableFunctions: FunctionDefinition[] = [];
      const answerContent = await (async () => {
        try {
          const messages = [
            ...conversation.messages.map(convertDbMessageToOpenAiMessage),
            latestMessage,
          ] satisfies OpenAiChatMessage[];
          logRequest({
            reqId,
            message: `LLM query: ${JSON.stringify(messages)}`,
          });
          // --- GENERATE RESPONSE ---
          // TODO - this is where the skunk magic happens
          //  - call the LLM
          const { newMessages, availableFunctionDefinitions } = await llm.answerAwaited({
            query,
            messages,
            availableFunctions,
            options: {}
          });
          logRequest({
            reqId,
            message: `LLM response: ${JSON.stringify(answer)}`,
          });
          // TODO - save the newMessages & availableFunctionDefinitions to the database
          const latestAssistantMessage = newMessages.slice().reverse().find(m => m.role === "assistant");
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

      // --- SAVE QUESTION & RESPONSE ---
      const { assistantMessage } = await addMessagesToDatabase({
        conversations,
        conversation,
        originalUserMessageContent: message,
        assistantMessageContent: answerContent,
        availableFunctions: availableFunctionDefinitions, // TODO
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
    availableFunctions: [],
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
  availableFunctions: FunctionDefinition[];
  conversations: ApiConversationsService;
}

export async function addMessagesToDatabase({
  conversation,
  originalUserMessageContent,
  assistantMessageContent,
  availableFunctions = [],
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
    availableFunctions,
  });
  const assistantMessage = await conversations.addApiConversationMessage({
    conversationId,
    message: {
      content: assistantMessageContent,
      role: "assistant",
    },
    newSystemPrompt: undefined,
    availableFunctions,
  });
  return { userMessage, assistantMessage };
}

/**
  This function will return the chunks that can fit in the maxTokens.
  It limits the number of tokens that are sent to the LLM.
 */
export function includeChunksForMaxTokensPossible({
  maxTokens,
  content,
}: {
  maxTokens: number;
  content: EmbeddedContent[];
}): EmbeddedContent[] {
  let total = 0;
  const fitRangeEndIndex = content.findIndex(
    ({ tokenCount }) => (total += tokenCount) > maxTokens
  );
  return fitRangeEndIndex === -1 ? content : content.slice(0, fitRangeEndIndex);
}

export function validateConversationForApiFormatting({
  conversation,
}: {
  conversation: ConversationForApi;
}) {
  const { messages } = conversation;
  if (
    messages?.length === 0 || // Must be messages in the conversation
    messages.length % 2 !== 0 // Must be an even number of messages
  ) {
    return false;
  }
  // Must alternate between assistant and user
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const isAssistant = i % 2 === 0;
    if (isAssistant && message.role !== "assistant") {
      return false;
    }
    if (!isAssistant && message.role !== "user") {
      return false;
    }
  }

  return true;
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
