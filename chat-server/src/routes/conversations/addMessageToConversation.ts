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
import { ApiConversation, convertMessageFromDbToApi } from "./utils";
import { sendErrorResponse } from "../../utils";

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
  dataStreamer: DataStreamerServiceInterface;
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
      // const {
      //   params: { conversationId: conversationIdString },
      //   body: { message },
      //   query: { stream },
      // } = req;

      const conversationIdString = req.params.conversationId;
      const message = req.body.message;
      const stream = req.query.stream;

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

      // let conversationInDb: Conversation | null;
      let conversationInDb: Conversation;
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

      if (conversationInDb.messages.length >= MAX_MESSAGES_IN_CONVERSATION) {
        return sendErrorResponse(
          res,
          400,
          `You cannot send more messages to this conversation. ` +
            `Max messages (${MAX_MESSAGES_IN_CONVERSATION}, including system prompt) exceeded. ` +
            `Start a new conversation.`
        );
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
          ipAddress,
          text: latestMessageText,
          store,
          findNearestNeighborsOptions,
        });
      } catch (err) {
        logger.error("Error getting content for text:", JSON.stringify(err));
        return sendErrorResponse(res, 500, "Error getting content for text");
      }
      if (!chunks || chunks.length === 0) {
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

      const furtherReading = generateFurtherReading({ chunks });

      const chunkTexts = chunks.map((chunk) => chunk.text);

      const latestMessage = {
        content: latestMessageText,
        role: "user",
      } satisfies OpenAiChatMessage;

      const messages = [
        ...conversationInDb.messages.map(convertDbMessageToOpenAiMessage),
        latestMessage,
      ] satisfies OpenAiChatMessage[];

      // Get (but don't await, yet) a Promise for the user message db insert
      const addUserMessagePromise = conversations.addConversationMessage({
        conversationId: conversationInDb._id,
        ...latestMessage,
      });

      let answerContent;
      if (shouldStream) {
        const answerStream = await llm.answerQuestionStream({
          messages,
          chunks: chunkTexts,
        });
        const answer = await dataStreamer.answer({
          res,
          answerStream,
          furtherReading,
        });
        logger.info(`LLM response: ${JSON.stringify(answer)}`);
        answerContent = answer + furtherReading;
      } else {
        try {
          const messages = [
            ...conversationInDb.messages.map(convertDbMessageToOpenAiMessage),
            latestMessage,
          ];
          logger.info(`LLM query: ${JSON.stringify(messages)}`);
          const answer = await llm.answerQuestionAwaited({
            messages,
            chunks: chunkTexts,
          });
          answer.content += generateFurtherReading({ chunks });
          logger.info(`LLM response: ${JSON.stringify(answer)}`);
          answerContent = answer.content;
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : JSON.stringify(err as object);
          logger.error("Error from LLM: " + errorMessage);
          await addUserMessagePromise;
          logger.info("LLM error: returning just the vector search results");
          answer = {
            role: "assistant",
            content:
              conversationConstants.LLM_NOT_WORKING +
              "\n\n" +
              generateFurtherReading({ chunks, hasHeading: false }),
          } satisfies OpenAiChatMessage;
          answerContent = answer.content;
        }
      }
      // TODO: consider refactoring addConversationMessage to take in an array of messages.
      // Would limit database calls.

      // Now that we're done with the LLM call, we can await the user message db insert
      await addUserMessagePromise;
      // ... and add the assistant message the LLM just generated
      const newMessage = await conversations.addConversationMessage({
        conversationId: conversationInDb._id,
        content: answerContent,
        role: "assistant",
      });
      if (shouldStream) {
        res.write(
          `data: ${JSON.stringify({ type: "finished", data: newMessage })}\n\n`
        );
        res.end();
      } else {
        res.status(200).json(convertMessageFromDbToApi(newMessage));
      }
    } catch (err) {
      logger.error("An unexpected error occurred: " + JSON.stringify(err));
      next(err);
    }
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
