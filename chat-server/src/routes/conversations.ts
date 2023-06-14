import { Router, Request } from "express";
import { embeddings } from "../services/embeddings";
import { database } from "../services/database";
import { llm } from "../services/llm";
import { dataStreamer } from "../services/dataStreamer";

const conversationsRouter = Router();

/**
 * Create new conversation.
 */
conversationsRouter.post(
  "/",
  async (req: RequestWithStreamParam, res, next) => {
    try {
      // TODO: implement type checking on the request

      const ipAddress = ""; // TODO: refactor to get IP address with middleware

      const conversationInDb = await database.conversations.create({
        ipAddress,
      });
      if (!conversationInDb) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.status(204).json({ id: conversationInDb.id });
    } catch (err) {
      next(err);
    }
  }
);

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
      const { status, embeddings: embeddingRes } =
        await embeddings.createEmbedding({
          text: latestMessage.content,
          userIp: ipAddress,
        });
      if (status !== 200) {
        return res.status(status).json({ error: "Embedding error" });
      }
      const chunks = await database.content.findVectorMatches({
        embedding: embeddingRes!,
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
            messages: [...conversationInDb.messages, latestMessage],
            chunks,
          }),
          conversation: conversationInDb,
          chunks,
        });
      } else {
        answer = await llm.answerQuestionAwaited({
          messages: [...conversationInDb.messages, latestMessage],
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

export { conversationsRouter };
