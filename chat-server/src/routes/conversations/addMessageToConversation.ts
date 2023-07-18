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
  EmbeddedContent,
  EmbeddedContentStore,
  logger,
  FindNearestNeighborsOptions,
  WithScore,
} from "chat-core";
import {
  Conversation,
  ConversationsServiceInterface,
  Message,
  conversationConstants,
} from "../../services/conversations";
import { DataStreamer } from "../../services/dataStreamer";

import {
  Llm,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "../../services/llm";
import {
  ApiConversation,
  areEquivalentIpAddresses,
  convertMessageFromDbToApi,
  isValidIp,
} from "./utils";
import { logRequest, sendErrorResponse } from "../../utils";

export const MAX_INPUT_LENGTH = 300; // magic number for max input size for LLM
export const MAX_MESSAGES_IN_CONVERSATION = 13; // magic number for max messages in a conversation

export interface AddMessageRequestBody {
  message: string;
}

export interface AddMessageRequest extends ExpressRequest {
  params: {
    conversationId: string;
  };
  body: AddMessageRequestBody;
  query: {
    stream: string;
  };
}
export interface AddMessageToConversationRouteParams {
  store: EmbeddedContentStore;
  conversations: ConversationsServiceInterface;
  embed: EmbedFunc;
  llm: Llm<OpenAiStreamingResponse, OpenAiAwaitedResponse>;
  dataStreamer: DataStreamer;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
}

export function makeAddMessageToConversationRoute({
  store,
  conversations,
  llm,
  dataStreamer,
  embed,
  findNearestNeighborsOptions,
}: AddMessageToConversationRouteParams) {
  return async (
    req: AddMessageRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    try {
      const {
        params: { conversationId: conversationIdString },
        body: { message },
        query: { stream },
        ip,
      } = req;
      let conversationId: ObjectId;
      try {
        conversationId = new ObjectId(conversationIdString);
      } catch (err) {
        return sendErrorResponse({
          reqId: req.headers["req-id"] as string,
          res,
          httpStatus: 400,
          errorMessage: "Invalid conversation ID",
        });
      }
      // TODO:(DOCSP-30863) implement type checking on the request

      if (!isValidIp(ip)) {
        return sendErrorResponse({
          reqId: req.headers["req-id"] as string,
          res,
          httpStatus: 400,
          errorMessage: `Invalid IP address ${ip}`,
        });
      }

      const shouldStream = Boolean(stream);
      const latestMessageText = message;
      if (latestMessageText.length > MAX_INPUT_LENGTH) {
        return sendErrorResponse({
          reqId: req.headers["req-id"] as string,
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
          reqId: req.headers["req-id"] as string,
          res,
          httpStatus: 500,
          errorMessage: "Error finding conversation",
        });
      }

      if (!conversationInDb) {
        return sendErrorResponse({
          res,
          reqId: req.headers["req-id"] as string,
          httpStatus: 404,
          errorMessage: "Conversation not found",
        });
      }
      if (!areEquivalentIpAddresses(conversationInDb.ipAddress, ip)) {
        return sendErrorResponse({
          res,
          reqId: req.headers["req-id"] as string,
          httpStatus: 403,
          errorMessage: "IP address does not match",
        });
      }

      if (conversationInDb.messages.length >= MAX_MESSAGES_IN_CONVERSATION) {
        return sendErrorResponse({
          res,
          reqId: req.headers["req-id"] as string,
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
          reqId: req.headers["req-id"] as string,
          res,
          httpStatus: 500,
          errorMessage: "Error getting content for text",
          errorDetails: JSON.stringify(err),
        });
      }
      if (!chunks || chunks.length === 0) {
        logRequest({
          reqId: req.headers["req-id"] as string,
          message: "No matching content found",
        });
        const { assistantMessage } = await addMessagesToDatabase({
          conversations,
          conversationId,
          userMessageContent: latestMessageText,
          assistantMessageContent: conversationConstants.NO_RELEVANT_CONTENT,
          assistantMessageReferences: [],
        });
        const apiRes = convertMessageFromDbToApi(assistantMessage);
        if (shouldStream) {
          dataStreamer.connect(res);
          dataStreamer.streamData({
            type: "delta",
            data: apiRes.content,
          });
          dataStreamer.streamData({
            type: "finished",
            data: apiRes.id,
          });
          dataStreamer.disconnect();
          return;
        } else {
          return res.status(200).json(apiRes);
        }
      }

      const references = generateReferences({ chunks });

      const chunkTexts = chunks.map((chunk) => chunk.text);

      const latestMessage = {
        content: latestMessageText,
        role: "user",
      } satisfies OpenAiChatMessage;

      const messages = [
        ...conversationInDb.messages.map(convertDbMessageToOpenAiMessage),
        latestMessage,
      ] satisfies OpenAiChatMessage[];

      let answerContent;
      if (shouldStream) {
        const answerStream = await llm.answerQuestionStream({
          messages,
          chunks: chunkTexts,
        });
        dataStreamer.connect(res);
        const streamedData = await dataStreamer.stream({
          stream: answerStream,
        });
        logger.info(`LLM response: ${JSON.stringify(streamedData)}`);
        await dataStreamer.streamData({
          type: "references",
          data: references,
        });
        answerContent = streamedData;
      } else {
        try {
          const messages = [
            ...conversationInDb.messages.map(convertDbMessageToOpenAiMessage),
            latestMessage,
          ];
          logRequest({
            reqId: req.headers["req-id"] as string,
            message: `LLM query: ${JSON.stringify(messages)}`,
          });
          answer = await llm.answerQuestionAwaited({
            messages,
            chunks: chunkTexts,
          });
          logRequest({
            reqId: req.headers["req-id"] as string,
            message: `LLM response: ${JSON.stringify(answer)}`,
          });
          answerContent = answer.content;
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : JSON.stringify(err);
          logRequest({
            reqId: req.headers["req-id"] as string,
            message: `LLM error: ${errorMessage}`,
            type: "error",
          });
          logRequest({
            reqId: req.headers["req-id"] as string,
            message: "Only sending vector search results to user",
          });
          answer = {
            role: "assistant",
            content: conversationConstants.LLM_NOT_WORKING,
          } satisfies OpenAiChatMessage;
          answerContent = answer.content;
        }
      }

      if (!answerContent) {
        throw new Error("No answer content");
      }

      const { assistantMessage } = await addMessagesToDatabase({
        conversations,
        conversationId,
        userMessageContent: latestMessageText,
        assistantMessageContent: answerContent,
        assistantMessageReferences: references,
      });

      const apiRes = convertMessageFromDbToApi(assistantMessage);
      if (shouldStream) {
        dataStreamer.streamData({
          type: "finished",
          data: apiRes.id,
        });
        dataStreamer.disconnect();
        return;
      } else {
        res.status(200).json(apiRes);
      }
    } catch (err) {
      logRequest({
        reqId: req.headers["req-id"] as string,
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
  assistantMessageReferences: References;
  conversations: ConversationsServiceInterface;
}
export async function addMessagesToDatabase({
  conversationId,
  userMessageContent,
  assistantMessageContent,
  assistantMessageReferences,
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
    references: assistantMessageReferences,
  });
  return { userMessage, assistantMessage };
}

export interface Reference {
  url: string;
  title: string;
}

export type References = Reference[];

export interface GenerateReferencesParams {
  chunks: EmbeddedContent[];
  hasHeading?: boolean;
}

export function generateReferences({ chunks }: GenerateReferencesParams): References {
  if (chunks.length === 0) {
    return [];
  }
  const uniqueLinks = Array.from(new Set(chunks.map((chunk) => chunk.url)));
  const mapLinkToReference = (link: string): Reference => {
    const url = new URL(link);
    url.searchParams.append("tck", "docs_chatbot");
    return {
      url: url.href,
      title: url.origin + url.pathname,
    };
  };

  return uniqueLinks.map((link) => mapLinkToReference(link));
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
