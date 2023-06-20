import { Router, Request } from "express";
import {
  EmbeddingProvider,
  EmbeddingService,
  embeddings,
} from "../services/embeddings";
import { database } from "../services/database";
import { LlmProvider, llm } from "../services/llm";
import {
  DataStreamerServiceInterface,
  dataStreamer,
} from "../services/dataStreamer";
import { OpenAiChatMessage, OpenAiMessageEnum } from "../integrations/openai";
import {
  Conversation,
  ConversationsService,
  ConversationsServiceInterface,
  Message,
} from "../services/conversations";
import { ContentService, ContentServiceInterface } from "../services/content";
interface ConversationResponse {
  id: string;
  messages: MessageResponse[];
}
interface MessageResponse {
  id: string;
  role: string;
  content: string;
  rating?: boolean;
}
interface RequestWithStreamParam extends Request {
  params: {
    stream: string;
  };
  body: {
    conversation: Message[];
    id: string;
    ipAddress: string;
  };
}
interface RatingRequest extends Request {
  params: {
    conversationId: string;
    messageId: string;
  };
  body: {
    conversation: Message[];
    id: string;
    ip_address: string;
    message_index: number;
    rating: boolean;
  };
}

// TODO: for all non-2XX or 3XX responses, see how/if can better implement
// error handling. can/should we pass stuff to next() and process elsewhere?
export interface ConversationsRouterParams<T, U> {
  llm: LlmProvider<T, U>;
  embeddings: EmbeddingService;
  dataStreamer: DataStreamerServiceInterface;
  content: ContentServiceInterface;
  conversations: ConversationsServiceInterface;
}
export function makeConversationsRouter({
  llm,
  embeddings,
  dataStreamer,
  content,
  conversations,
}: ConversationsRouterParams<T, U>) {
  const conversationsRouter = Router();

  /**
   * Create new conversation.
   */
  conversationsRouter.post("/", async (req, res, next) => {
    try {
      // TODO: implement type checking on the request

      const ipAddress = "<NOT CAPTURING IP ADDRESS YET>"; // TODO: refactor to get IP address with middleware

      const conversationInDb = await database.conversations.create({
        ipAddress,
      });
      if (!conversationInDb) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.status(204).json({ conversation: conversationInDb });
    } catch (err) {
      next(err);
    }
  });

  /**
   * Create a new message from the user and get response from the LLM.
   */
  conversationsRouter.post(
    "/:conversationId/messages",
    async (req: RequestWithStreamParam, res, next) => {
      try {
        // TODO: implement type checking on the request

        const ipAddress = ""; // TODO: refactor to get IP address with middleware

        const stream = Boolean(req.params.stream);
        const { conversation, id } = req.body;
        const latestMessage = conversation[conversation.length - 1];
        // TODO: implement error handling
        const { embedding } = await embeddings.createEmbedding({
          text: latestMessage.content,
          userIp: ipAddress,
        });
        const chunks = await database.content.findVectorMatches({
          embedding,
        });

        const conversationInDb = await database.conversations.findById({ id });
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
              chunks,
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
            chunks,
          });

          const successfulOperation = await database.conversations.addMessage({
            conversation: conversationInDb,
            answer,
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
    }
  );

  /**
   * Rate a message.
   */
  conversationsRouter.post(
    "/:conversationId/messages/:messageId/rating",
    async (req: RatingRequest, res, next) => {
      try {
        // TODO: implement type checking on the request

        const ipAddress = ""; // TODO: refactor to get IP address with middleware

        const { conversationId, messageId } = req.params;
        const { rating } = req.body;

        const conversationInDb = await database.conversations.findById({
          id: conversationId,
        });
        if (!conversationInDb) {
          return res.status(404).json({ error: "Conversation not found" });
        }
        if (conversationInDb.ipAddress !== ipAddress) {
          return res
            .status(403)
            .json({ error: "IP address does not match conversation" });
        }
        const successfulOperation = await database.conversations.rateMessage({
          conversationId,
          messageId,
          rating,
        });
        if (successfulOperation) {
          return res.status(204);
        } else {
          return res.status(404).json({ error: "Message not found" });
        }
      } catch (err) {
        next(err);
      }
    }
  );
  return conversationsRouter;
}

// helpers
export function convertConversationToResponse(
  conversation: Conversation
): ConversationResponse {
  return {
    id: conversation._id.toString(),
    messages: conversation.messages.map((message) => ({
      id: message.id.toString(),
      role: message.role,
      content: message.content,
      rating: message.rating,
    })),
  };
}
