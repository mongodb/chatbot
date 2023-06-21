import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { Conversation } from "./services/conversations";
import { logger } from "./services/logger";

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
  errorMessage: string
) => {
  logger.error(
    `Responding with ${httpStatus} status and error message: ${errorMessage}`
  );
  return res.status(httpStatus).json({ error: errorMessage });
};
