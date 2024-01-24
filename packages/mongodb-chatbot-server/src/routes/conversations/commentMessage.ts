import { ObjectId } from "mongodb-rag-core";
import { ConversationsService } from "../../services/ConversationsService";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { z } from "zod";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";

export type CommentMessageRequest = z.infer<typeof CommentMessageRequest>;

export const CommentMessageRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    params: z.object({
      conversationId: z.string(),
      messageId: z.string(),
    }),
    body: z.object({
      comment: z.string().min(1, { message: "Comment cannot be empty" }),
    }),
  })
);

export interface CommentMessageRouteParams {
  conversations: ConversationsService;
  maxCommentLength?: number;
}

export function makeCommentMessageRoute({
  conversations,
  maxCommentLength,
}: CommentMessageRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<void>,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      const { conversationId: conversationIdStr, messageId: messageIdStr } =
        req.params;
      const { comment } = req.body;
      let conversationId: ObjectId, messageId: ObjectId;
      try {
        conversationId = new ObjectId(conversationIdStr);
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Invalid conversation ID",
        });
      }
      try {
        messageId = new ObjectId(messageIdStr);
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Invalid message ID",
        });
      }

      if (maxCommentLength && comment.length > maxCommentLength) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: `Comment must contain ${maxCommentLength} characters or fewer`,
        });
      }

      const conversationInDb = await conversations.findById({
        _id: conversationId,
      });

      if (!conversationInDb) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 404,
          errorMessage: "Conversation not found",
        });
      }

      const existingMessage = conversationInDb.messages.find((message) =>
        message.id.equals(messageId)
      );

      if (existingMessage === undefined) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 404,
          errorMessage: "Message not found",
        });
      }

      if (existingMessage.role !== "assistant") {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Cannot comment on a non-assistant message",
        });
      }

      if (existingMessage.rating === undefined) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Cannot comment on a message with no rating",
        });
      }

      if (existingMessage.userComment !== undefined) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage:
            "Cannot comment on a message that already has a comment",
        });
      }

      try {
        await conversations.commentMessage({
          conversationId,
          messageId,
          comment,
        });

        res.sendStatus(204);
        logRequest({
          reqId,
          message: `Added a user comment to ${messageIdStr} in conversation ${conversationIdStr}: "${comment}"`,
        });
        return;
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Invalid comment",
        });
      }
    } catch (err) {
      next(err);
    }
  };
}
