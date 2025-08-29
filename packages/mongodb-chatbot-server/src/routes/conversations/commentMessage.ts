import { ConversationsService } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { z } from "zod";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";
import { Logger } from "mongodb-rag-core/braintrust";
import {
  UpdateTraceFunc,
  updateTraceIfExists,
} from "../../processors/UpdateTraceFunc";

export type CommentStandaloneMessageRequest = z.infer<
  typeof CommentStandaloneMessageRequest
>;

export const CommentStandaloneMessageRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    params: z.object({
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
  updateTrace?: UpdateTraceFunc;
  braintrustLogger?: Logger<true>;
}

export function makeCommentMessageRouteV2({
  conversations,
  maxCommentLength,
  updateTrace,
  braintrustLogger,
}: CommentMessageRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<void>,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      const { messageId: messageIdStr } = req.params;
      const { comment } = req.body;
      let messageId: ObjectId;

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

      const conversationInDb = await conversations.findByMessageId({
        messageId,
      });

      if (!conversationInDb) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 404,
          errorMessage: "Message not found",
        });
      }

      const existingMessage = conversationInDb.messages.findLast((message) =>
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

      const shouldStoreComment =
        conversationInDb.storeMessageContent === true ||
        conversationInDb.storeMessageContent === undefined;

      try {
        await conversations.commentMessage({
          conversationId: conversationInDb._id,
          messageId,
          comment: shouldStoreComment ? comment : "",
        });

        res.sendStatus(204);
        logRequest({
          reqId,
          message: `Added a user comment to ${messageIdStr} in conversation ${conversationInDb._id.toHexString()}: "${comment}"`,
        });
        const traceId = messageId.toHexString();
        if (braintrustLogger) {
          braintrustLogger.logFeedback({
            id: traceId,
            comment,
          });
        }
        await updateTraceIfExists({
          updateTrace,
          reqId,
          conversations,
          conversationId: conversationInDb._id,
          assistantResponseMessageId: messageId,
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

/**
  @deprecated Use CommentStandaloneMessageRequest instead.
 */
export type CommentMessageRequest = z.infer<typeof CommentMessageRequest>;

/**
  @deprecated Use CommentStandaloneMessageRequest instead.
 */
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

/**
  @deprecated Use makeCommentMessageRouteV2 instead.
 */
export function makeCommentMessageRoute({
  conversations,
  maxCommentLength,
  updateTrace,
  braintrustLogger,
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

      const existingMessage = conversationInDb.messages.findLast((message) =>
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

      const shouldStoreComment =
        conversationInDb.storeMessageContent === true ||
        conversationInDb.storeMessageContent === undefined;

      try {
        await conversations.commentMessage({
          conversationId,
          messageId,
          comment: shouldStoreComment ? comment : "",
        });

        res.sendStatus(204);
        logRequest({
          reqId,
          message: `Added a user comment to ${messageIdStr} in conversation ${conversationIdStr}: "${comment}"`,
        });
        const traceId = messageId.toHexString();
        if (braintrustLogger) {
          braintrustLogger.logFeedback({
            id: traceId,
            comment,
          });
        }
        await updateTraceIfExists({
          updateTrace,
          reqId,
          conversations,
          conversationId,
          assistantResponseMessageId: messageId,
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
