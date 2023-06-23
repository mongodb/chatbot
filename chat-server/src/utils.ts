import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { logger } from "chat-core";
import { stripIndent } from "common-tags";

/**
 * Checks for req-id Request Header. Returns an empty string if the header is not
 * a truthy string.
 *
 * @param req
 * @returns
 */
export const getRequestId = (req: ExpressRequest) => {
  const reqId = req.headers["req-id"];
  if (!reqId) {
    return undefined;
  } else if (Array.isArray(reqId)) {
    return undefined;
  } else {
    return reqId;
  }
};

export const sendErrorResponse = (
  res: ExpressResponse,
  httpStatus: number,
  errorMessage: string,
  errorDetails?: string
) => {
  logger.error(
    stripIndent`Responding with ${httpStatus} status and error message: ${errorMessage}.
    ${errorDetails ? `Error details: ${errorDetails}` : ""}`
  );
  return res.status(httpStatus).json({ error: errorMessage });
};
