import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import {
  OpenAiChatMessage,
  ObjectId,
  OpenAiMessageRole,
  EmbedFunc,
  FindNearestNeighborsOptions,
  WithScore,
} from "chat-core";
import { EmbeddedContent, EmbeddedContentStore } from "chat-core";
import {
  Conversation,
  ConversationsServiceInterface,
  Message,
  conversationConstants,
} from "../../services/conversations";
import { DataStreamerServiceInterface } from "../../services/dataStreamer";

import {
  Llm,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "../../services/llm";
import {
  ApiConversation,
  ApiMessage,
  areEquivalentIpAddresses,
  convertMessageFromDbToApi,
  isValidIp,
} from "./utils";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { z } from "zod";

export const MAX_INPUT_LENGTH = 300; // magic number for max input size for LLM
export const MAX_MESSAGES_IN_CONVERSATION = 13; // magic number for max messages in a conversation

export type AddMessageRequestBody = z.infer<typeof AddMessageRequestBody>;
export const AddMessageRequestBody = z.object({
  message: z.string(),
});

export type AddMessageRequest = z.infer<typeof AddMessageRequest>;
export const AddMessageRequest = z.object({
  headers: z.object({
    "req-id": z.string(),
  }),
  params: z.object({
    conversationId: z.string(),
  }),
  query: z.object({
    stream: z.string().optional(),
  }),
  body: AddMessageRequestBody,
  ip: z.string(),
});

// ExpressResponse;

export interface AddMessageToConversationRouteParams {
  store: EmbeddedContentStore;
  conversations: ConversationsServiceInterface;
  embed: EmbedFunc;
  llm: Llm<OpenAiStreamingResponse, OpenAiAwaitedResponse>;
  dataStreamer: DataStreamerServiceInterface;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
}

export function makeAddMessageToConversationRoute({
  store,
  conversations,
  llm,
  // dataStreamer,
  embed,
  findNearestNeighborsOptions,
}: AddMessageToConversationRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<ApiMessage>,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      const {
        params: { conversationId: conversationIdString },
        body: { message },
        query: { stream },
        ip,
      } = req;
      // TODO:(DOCSP-30863) implement type checking on the request

      let conversationId: ObjectId;
      try {
        conversationId = new ObjectId(conversationIdString);
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Invalid conversation ID",
        });
      }

      if (!isValidIp(ip)) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: `Invalid IP address ${ip}`,
        });
      }

      const shouldStream = Boolean(stream);
      const latestMessageText = message;
      if (latestMessageText.length > MAX_INPUT_LENGTH) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Message too long",
        });
      }

      let conversationInDb: Conversation | null;
      try {
        conversationInDb = await conversations.findById({
          _id: conversationId,
        });
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 500,
          errorMessage: "Error finding conversation",
        });
      }

      if (!conversationInDb) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 404,
          errorMessage: "Conversation not found",
        });
      }
      if (!areEquivalentIpAddresses(conversationInDb.ipAddress, ip)) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 403,
          errorMessage: "IP address does not match",
        });
      }

      if (conversationInDb.messages.length >= MAX_MESSAGES_IN_CONVERSATION) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage:
            `You cannot send more messages to this conversation. ` +
            `Max messages (${MAX_MESSAGES_IN_CONVERSATION}, including system prompt) exceeded. ` +
            `Start a new conversation.`,
        });
      }

      let answer: OpenAiChatMessage;

      // Find content matches for latest message
      // TODO: consider refactoring this to feed in all messages to the embed function
      // And then as a future step, we can use LLM pre-processing to create a better input
      // to the embedding service.

      let chunks: WithScore<EmbeddedContent>[];
      try {
        chunks = await getContentForText({
          embed,
          ipAddress: ip,
          text: latestMessageText,
          store,
          findNearestNeighborsOptions,
        });
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 500,
          errorMessage: "Error getting content for text",
          errorDetails: JSON.stringify(err),
        });
      }
      if (!chunks || chunks.length === 0) {
        logRequest({
          reqId,
          message: "No matching content found",
        });
        const { assistantMessage } = await addMessagesToDatabase({
          conversations,
          conversationId,
          userMessageContent: latestMessageText,
          assistantMessageContent: conversationConstants.NO_RELEVANT_CONTENT,
        });
        const apiRes = convertMessageFromDbToApi(assistantMessage);
        return res.status(200).json(apiRes);
      }

      const chunkTexts = chunks.map((chunk) => chunk.text);
      const latestMessage: OpenAiChatMessage = {
        content: latestMessageText,
        role: "user",
      };

      if (shouldStream) {
        // TODO:(DOCSP-30866) add streaming support to endpoint
        throw new Error("Streaming not implemented yet");
        // answer = await dataStreamer.answer({
        //   res,
        //   answer: llm.answerQuestionStream({
        //     messages: [
        //       ...conversationInDb.messages,
        //       latestMessageText,
        //     ] as OpenAiChatMessage[],
        //     chunks: chunkTexts,
        //   }),
        //   conversation: conversationInDb,
        //   chunks,
        // });
      } else {
        try {
          const messages = [
            ...conversationInDb.messages.map(convertDbMessageToOpenAiMessage),
            latestMessage,
          ];
          logRequest({
            reqId,
            message: `LLM query: ${JSON.stringify(messages)}`,
          });
          answer = await llm.answerQuestionAwaited({
            messages,
            chunks: chunkTexts,
          });
          answer.content += generateFurtherReading({ chunks });
          logRequest({
            reqId,
            message: `LLM response: ${JSON.stringify(answer)}`,
          });
        } catch (err) {
          logRequest({
            reqId,
            message: `LLM error: ${JSON.stringify(err)}`,
            type: "error",
          });
          logRequest({
            reqId,
            message: "Only sending vector search results to user",
          });
          answer = {
            role: "assistant",
            content:
              conversationConstants.LLM_NOT_WORKING +
              "\n\n" +
              generateFurtherReading({ chunks, hasHeading: false }),
          };
        }
        const { assistantMessage } = await addMessagesToDatabase({
          conversations,
          conversationId,
          userMessageContent: latestMessageText,
          assistantMessageContent: answer.content,
        });
        const apiRes = convertMessageFromDbToApi(assistantMessage);
        return res.status(200).json(apiRes);
      }
    } catch (err) {
      logRequest({
        reqId,
        message: "An unexpected error occurred: " + JSON.stringify(err),
        type: "error",
      });
      next(err);
    }
  };
}

export interface GetContentForTextParams {
  embed: EmbedFunc;
  ipAddress: string;
  text: string;
  store: EmbeddedContentStore;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
}

export function convertDbMessageToOpenAiMessage(
  message: Message
): OpenAiChatMessage {
  return {
    content: message.content,
    role: message.role as OpenAiMessageRole,
  };
}

export async function getContentForText({
  embed,
  store,
  text,
  ipAddress,
  findNearestNeighborsOptions,
}: GetContentForTextParams) {
  const { embedding } = await embed({
    text,
    userIp: ipAddress,
  });
  return await store.findNearestNeighbors(
    embedding,
    findNearestNeighborsOptions
  );
}

interface AddMessagesToDatabaseParams {
  conversationId: ObjectId;
  userMessageContent: string;
  assistantMessageContent: string;
  conversations: ConversationsServiceInterface;
}
export async function addMessagesToDatabase({
  conversationId,
  userMessageContent,
  assistantMessageContent,
  conversations,
}: AddMessagesToDatabaseParams) {
  // TODO: consider refactoring addConversationMessage to take in an array of messages.
  // Would limit database calls.
  const userMessage = await conversations.addConversationMessage({
    conversationId,
    content: userMessageContent,
    role: "user",
  });
  const assistantMessage = await conversations.addConversationMessage({
    conversationId,
    content: assistantMessageContent,
    role: "assistant",
  });
  return { userMessage, assistantMessage };
}

export interface GenerateFurtherReadingParams {
  chunks: EmbeddedContent[];
  hasHeading?: boolean;
}
export function generateFurtherReading({
  chunks,
  hasHeading = true,
}: GenerateFurtherReadingParams) {
  if (chunks.length === 0) {
    return "";
  }
  const heading = hasHeading ? "\n\nFurther Reading:\n\n" : "";
  const uniqueLinks = Array.from(new Set(chunks.map((chunk) => chunk.url)));

  const linksText = uniqueLinks.reduce((acc, link) => {
    const url = new URL(link);
    url.searchParams.append("tck", "docs_chatbot");
    const linkListItem = `[${url.origin + url.pathname}](${url.href})\n\n`;
    return acc + linkListItem;
  }, "");
  return heading + linksText;
}

export function validateApiConversationFormatting({
  conversation,
}: {
  conversation: ApiConversation;
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
