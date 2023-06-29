import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import {
  OpenAiChatMessage,
  ObjectId,
  OpenAiMessageRole,
  EmbeddingService,
  logger,
} from "chat-core";
import { Content, ContentServiceInterface } from "chat-core";
import {
  Conversation,
  ConversationsServiceInterface,
  Message,
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
  content: ContentServiceInterface;
  conversations: ConversationsServiceInterface;
  embeddings: EmbeddingService;
  llm: LlmProvider<OpenAiStreamingResponse, OpenAiAwaitedResponse>;
  dataStreamer: DataStreamerServiceInterface;
}
export function makeAddMessageToConversationRoute({
  content,
  conversations,
  llm,
  dataStreamer,
  embeddings,
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

      console.log("conversationIdString", conversationIdString);
      console.log("message", message);
      console.log("stream", stream);

      let conversationId: ObjectId;
      try {
        conversationId = new ObjectId(conversationIdString);
      } catch (err) {
        return sendErrorResponse(res, 400, "Invalid conversation ID");
      }
      console.log("conversationId", conversationId);
      console.log("message", message);
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

      // Find content matches for latest message
      // TODO: consider refactoring this to feed in all messages to the embeddings service
      // And then as a future step, we can use LLM pre-processing to create a better input
      // to the embedding service.
      const chunks = await getContentForText({
        embeddings,
        ipAddress,
        text: latestMessageText,
        content,
      });

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

      let answerContent;
      if (shouldStream) {
        // TODO:(DOCSP-30866) add streaming support to endpoint
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
          logger.info(`LLM response: ${JSON.stringify(answer)}`);
          answerContent = answer.content + furtherReading;
        } catch (err: any) {
          logger.error("Error from LLM: " + JSON.stringify(err));
          return sendErrorResponse(res, 500, "Error from LLM", err.message);
        }
        // TODO: consider refactoring addConversationMessage to take in an array of messages.
        // Would limit database calls.
        await conversations.addConversationMessage({
          conversationId: conversationInDb._id,
          ...latestMessage,
        });
        const newMessage = await conversations.addConversationMessage({
          conversationId: conversationInDb._id,
          content: answerContent,
          role: "assistant",
        });
        const apiRes = convertMessageFromDbToApi(newMessage);
        res.status(200).json(apiRes);
      }
    } catch (err) {
      logger.error("An unexpected error occurred: " + JSON.stringify(err));
      next(err);
    }
  };
}

export interface GetContentForTextParams {
  embeddings: EmbeddingService;
  ipAddress: string;
  text: string;
  content: ContentServiceInterface;
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
  embeddings,
  content,
  text,
  ipAddress,
}: GetContentForTextParams) {
  const { embedding } = await embeddings.createEmbedding({
    text,
    userIp: ipAddress,
  });
  const chunks = await content.findVectorMatches({
    embedding,
  });
  return chunks;
}

export interface GenerateFurtherReadingParams {
  chunks: Content[];
}
export function generateFurtherReading({
  chunks,
}: GenerateFurtherReadingParams) {
  if (chunks.length === 0) {
    return "";
  }
  const heading = "\n\n**Articles Referenced:**\n\n";
  const uniqueLinks = Array.from(new Set(chunks.map((chunk) => chunk.url)));

  const linksText =
    uniqueLinks.reduce((acc, link) => {
      const linkListItem = `- [${link}](${link})\n`;
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
