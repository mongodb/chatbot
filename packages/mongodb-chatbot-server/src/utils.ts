import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import {
  Conversation,
  DbMessage,
  logger,
  Message,
  ToolMessage,
} from "mongodb-rag-core";
import { stripIndent } from "common-tags";

/**
  Checks for req-id Request Header. Returns an empty string if the header is not
  a truthy string.
  @param req
 */
export function getRequestId<T extends ExpressRequest>(req: T) {
  const reqId = req.header("req-id");
  if (!reqId) {
    return "";
  }
  return reqId;
}

export interface LogRequestParams {
  reqId: string;
  message: string;
  type?: "info" | "error" | "warn";
}

export const logRequest = ({
  reqId,
  message,
  type = "info",
}: LogRequestParams) => {
  logger[type]({ reqId, message });
};

export interface ErrorResponseParams {
  reqId: string;
  res: ExpressResponse;
  httpStatus: number;
  errorMessage: string;
  errorDetails?: string;
}

export const sendErrorResponse = ({
  reqId,
  res,
  httpStatus,
  errorMessage,
  errorDetails,
}: ErrorResponseParams) => {
  logRequest({
    reqId,
    type: "error",
    message: stripIndent`Responding with ${httpStatus} status and error message: ${errorMessage}.
    ${errorDetails ? `Error details: ${errorDetails}` : ""}`,
  });
  if (!res.writableEnded) {
    return res.status(httpStatus).json({ error: errorMessage });
  }
};

export function retryAsyncOperation<T>(
  promise: Promise<T>,
  retries = 4,
  delayMs = 3000
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const operation = promise;
    const timeout = new Promise<never>((_, rejectTimeout) => {
      setTimeout(() => {
        rejectTimeout(new Error("Timed out"));
      }, delayMs);
    });

    Promise.race([operation, timeout])
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        if (retries === 0) {
          reject(error);
        } else {
          console.log(`Retrying... ${retries} attempts left`);
          console.log(promise);
          resolve(retryAsyncOperation<T>(promise, retries - 1, delayMs));
        }
      });
  });
}

/**
  Create a slimmed down version of the conversation to
  send to Braintrust for tracing.
  This sends less data to Braintrust speeding up tracing
  and also being more readable in the Braintrust UI.
 */
export function makeTraceConversation(
  conversation: Conversation
): Conversation {
  return {
    ...conversation,
    messages: conversation.messages.map((message) => {
      const baseFields = {
        content: message.content,
        id: message.id,
        createdAt: message.createdAt,
        metadata: message.metadata,
      };

      if (message.role === "tool") {
        return {
          role: "tool",
          name: message.name,
          ...baseFields,
        } satisfies DbMessage<ToolMessage>;
      } else {
        return { ...baseFields, role: message.role } satisfies Exclude<
          Message,
          ToolMessage
        >;
      }
    }),
  };
}
