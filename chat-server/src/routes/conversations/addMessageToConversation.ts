import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { OpenAiChatMessage } from "../../integrations/openai";
import { ContentServiceInterface } from "../../services/content";
import {
  ConversationsServiceInterface,
  Message,
} from "../../services/conversations";
import { DataStreamerServiceInterface } from "../../services/dataStreamer";
import { EmbeddingService } from "../../services/embeddings";
import {
  LlmProvider,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "../../services/llm";
import { ObjectId } from "mongodb";

interface RequestWithStreamParam extends ExpressRequest {
  params: {
    stream: string;
  };
  body: {
    conversation: Message[];
    id: string;
    ipAddress: string;
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
    req: RequestWithStreamParam,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    try {
      // TODO: implement type checking on the request

      const ipAddress = "<NOT CAPTURING IP ADDRESS YET>"; // TODO: refactor to get IP address with middleware

      const stream = Boolean(req.params.stream);
      const { conversation, id } = req.body;
      const latestMessage = conversation[conversation.length - 1];
      // TODO: implement error handling
      const { embedding } = await embeddings.createEmbedding({
        text: latestMessage.content,
        userIp: ipAddress,
      });
      const chunks = await content.findVectorMatches({
        embedding,
      });
      const chunkTexts = chunks.map((chunk) => chunk.text);

      const conversationInDb = await conversations.findById({
        _id: new ObjectId(id),
      });
      if (!conversationInDb) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      if (conversationInDb.ipAddress !== req.body.ipAddress) {
        return res.status(403).json({ error: "IP address does not match" });
      }

      let answer;
      if (stream) {
        answer = await dataStreamer.answer({
          res,
          answer: llm.answerQuestionStream({
            messages: [
              ...conversationInDb.messages,
              latestMessage,
            ] as OpenAiChatMessage[],
            chunks: chunkTexts,
          }),
          conversation: conversationInDb,
          chunks,
        });
      } else {
        answer = await llm.answerQuestionAwaited({
          messages: [
            ...conversationInDb.messages,
            latestMessage,
          ] as OpenAiChatMessage[],
          chunks: chunkTexts,
        });

        const successfulOperation = await conversations.addUserMessage({
          conversationId: conversationInDb._id,
          content: answer.content,
        });
        if (successfulOperation) {
          return res.status(200).send(answer);
        } else {
          return res.status(500).json({ error: "Internal server error" });
        }
      }
    } catch (err) {
      next(err);
    }
  };
}
