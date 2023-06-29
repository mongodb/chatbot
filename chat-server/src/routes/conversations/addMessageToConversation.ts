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
  logger,
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
  LlmProvider,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "../../services/llm";
import { ApiConversation, convertMessageFromDbToApi } from "./utils";
import { sendErrorResponse } from "../../utils";

const MAX_INPUT_LENGTH = 300; // magic number for max input size for LLM

// - [ ] Rate limit exceeded
//   - If too many clients are using the chatbot, friendly response message in chat saying that there are too many users and the user should try again later.

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
  llm: LlmProvider<OpenAiStreamingResponse, OpenAiAwaitedResponse>;
  dataStreamer: DataStreamerServiceInterface;
}

export function makeAddMessageToConversationRoute({
  store,
  conversations,
  llm,
  dataStreamer,
  embed,
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
      } = req;
      let conversationId: ObjectId;
      try {
        conversationId = new ObjectId(conversationIdString);
      } catch (err) {
        return sendErrorResponse(res, 400, "Invalid conversation ID");
      }

      // TODO:(DOCSP-30863) implement type checking on the request

      const ipAddress = "<NOT CAPTURING IP ADDRESS YET>"; // TODO:(DOCSP-30843) refactor to get IP address with middleware

      const shouldStream = Boolean(stream);
      const latestMessageText = message;
      if (latestMessageText.length > MAX_INPUT_LENGTH) {
        return sendErrorResponse(res, 400, "Message too long");
      }

      let conversationInDb: Conversation | null;
      try {
        conversationInDb = await conversations.findById({
          _id: conversationId,
        });
      } catch (err) {
        return sendErrorResponse(res, 500, "Error finding conversation");
      }

      if (!conversationInDb) {
        return sendErrorResponse(res, 404, "Conversation not found");
      }
      if (conversationInDb.ipAddress !== ipAddress) {
        return sendErrorResponse(res, 403, "IP address does not match");
      }

      let answer: OpenAiChatMessage;

      // Find content matches for latest message
      // TODO: consider refactoring this to feed in all messages to the embed function
      // And then as a future step, we can use LLM pre-processing to create a better input
      // to the embedding service.
      const chunks = await getContentForText({
        embed,
        ipAddress,
        text: latestMessageText,
        store,
      });
      if (chunks.length === 0) {
        logger.info("No matching content found");
        const { assistantMessage } = await addMessagesToDatabase({
          conversations,
          conversationId,
          userMessageContent: latestMessageText,
          assistantMessageContent: conversationConstants.NO_RELEVANT_CONTENT,
        });
        const apiRes = convertMessageFromDbToApi(assistantMessage);
        res.status(200).json(apiRes);
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
          logger.info(`LLM query: ${JSON.stringify(messages)}`);
          answer = await llm.answerQuestionAwaited({
            messages,
            chunks: chunkTexts,
          });
          answer.content += generateFurtherReading({ chunks });
          logger.info(`LLM response: ${JSON.stringify(answer)}`);
        } catch (err: any) {
          logger.error("Error from LLM: " + JSON.stringify(err));
          logger.info("Only sending vector search results to user");
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
        res.status(200).json(apiRes);
      }
    } catch (err) {
      logger.error("An unexpected error occurred: " + JSON.stringify(err));
      next(err);
    }
  };
}

export interface GetContentForTextParams {
  embed: EmbedFunc;
  ipAddress: string;
  text: string;
  store: EmbeddedContentStore;
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
}: GetContentForTextParams) {
  const { embedding } = await embed({
    text,
    userIp: ipAddress,
  });
  return store.findNearestNeighbors(embedding);
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
  chunks: Content[];
  hasHeading?: boolean;
}
export function generateFurtherReading({
  chunks,
  hasHeading = true,
}: GenerateFurtherReadingParams) {
  if (chunks.length === 0) {
    return "";
  }
  const heading = hasHeading ? "\n\nFurther Reading:\n" : "";
  const uniqueLinks = Array.from(new Set(chunks.map((chunk) => chunk.url)));

  const linksText =
    uniqueLinks.reduce((acc, link) => {
      const linkListItem = `[${link}](${link}?tck=docs_chatbot)\n`;
      return acc + linkListItem;
    }, "") + "\n";
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
