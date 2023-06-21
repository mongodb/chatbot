import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { ObjectId } from "mongodb";
import { OpenAiChatMessage } from "../../integrations/openai";
import { Content, ContentServiceInterface } from "../../services/content";
import { ConversationsServiceInterface } from "../../services/conversations";
import { DataStreamerServiceInterface } from "../../services/dataStreamer";
import { EmbeddingService } from "../../services/embeddings";
import {
  LlmProvider,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "../../services/llm";
import { ApiConversation, convertMessageFromDbToApi } from "./utils";
import { sendErrorResponse } from "../../utils";
import { logger } from "../../services/logger";

const MAX_INPUT_LENGTH = 300; // magic number for max input size for LLM

interface RequestWithStreamParam extends ExpressRequest {
  params: {
    stream: string;
  };
  body: ApiConversation;
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
    req: RequestWithStreamParam,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    try {
      // TODO: implement type checking on the request

      if (!validateApiConversationFormatting({ conversation: req.body })) {
        return sendErrorResponse(res, 400, "Invalid conversation formatting");
      }

      const ipAddress = "<NOT CAPTURING IP ADDRESS YET>"; // TODO: refactor to get IP address with middleware

      const stream = Boolean(req.params.stream);
      const { messages, id } = req.body;
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.content.length > MAX_INPUT_LENGTH) {
        return sendErrorResponse(res, 400, "Message too long");
      }

      const conversationInDb = await conversations.findById({
        _id: new ObjectId(id),
      });
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
        text: latestMessage.content,
        content,
      });

      const chunkTexts = chunks.map((chunk) => chunk.text);

      let answer;
      if (stream) {
        throw new Error("Streaming not implemented yet");
        // answer = await dataStreamer.answer({
        //   res,
        //   answer: llm.answerQuestionStream({
        //     messages: [
        //       ...conversationInDb.messages,
        //       latestMessage,
        //     ] as OpenAiChatMessage[],
        //     chunks: chunkTexts,
        //   }),
        //   conversation: conversationInDb,
        //   chunks,
        // });
      } else {
        try {
          const messages = [
            ...conversationInDb.messages,
            latestMessage,
          ] as OpenAiChatMessage[];
          logger.info(`LLM query: ${JSON.stringify(messages)}`);
          answer = await llm.answerQuestionAwaited({
            messages: [
              ...conversationInDb.messages,
              latestMessage,
            ] as OpenAiChatMessage[],
            chunks: chunkTexts,
          });
          logger.info(`LLM response: ${JSON.stringify(answer)}`);
        } catch (err) {
          return sendErrorResponse(res, 500, "Error from LLM");
        }
        // TODO: consider refactoring addConversationMessage to take in an array of messages.
        // Would limit database calls.
        await conversations.addConversationMessage({
          conversationId: conversationInDb._id,
          content: latestMessage.content,
          role: "user",
        });
        const newMessage = await conversations.addConversationMessage({
          conversationId: conversationInDb._id,
          content: answer.content + generateFurtherReading({ chunks }),
          role: "assistant",
        });
        const apiRes = convertMessageFromDbToApi(newMessage);
        res.status(200).json(apiRes);
      }
    } catch (err) {
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

export async function getContentForText({
  embeddings,
  ipAddress,
  text,
  content,
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
  const heading = "\n\n## Further Reading\n\n";
  const uniqueLinks = new Array(new Set(chunks.map((chunk) => chunk.url)));
  const linksText =
    uniqueLinks.reduce((acc, link) => {
      const linkListItem = `- ${link}\n`;
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
