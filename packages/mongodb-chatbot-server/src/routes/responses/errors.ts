import {
  APIError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  RateLimitError,
} from "mongodb-rag-core/openai";
import { logger } from "mongodb-rag-core";
import type { Response as ExpressResponse } from "express";
import type { ZodError } from "zod";
import { generateErrorMessage } from "zod-error";

interface SendErrorResponseParams {
  reqId: string;
  res: ExpressResponse;
  error: APIError;
}

export const sendErrorResponse = ({
  reqId,
  res,
  error,
}: SendErrorResponseParams) => {
  const httpStatus = error.status ?? 500;

  logger.error({
    reqId,
    message: `Responding with ${httpStatus} status and error message: ${error.message}.`,
  });

  if (!res.writableEnded) {
    return res.status(httpStatus).json(error);
  }
};

// --- OPENAI ERROR CONSTANTS ---
export const ERROR_TYPE = "error";
export enum ERROR_CODE {
  INVALID_REQUEST_ERROR = "invalid_request_error",
  NOT_FOUND_ERROR = "not_found_error",
  RATE_LIMIT_ERROR = "rate_limit_error",
  SERVER_ERROR = "server_error",
}

// --- OPENAI ERROR WRAPPERS ---
interface MakeOpenAIErrorParams {
  error: Error;
  headers: Record<string, string>;
}

export const makeInternalServerError = ({
  error,
  headers,
}: MakeOpenAIErrorParams): APIError => {
  const message = error.message ?? "Internal server error";
  const _error = {
    ...error,
    type: ERROR_TYPE,
    code: ERROR_CODE.SERVER_ERROR,
    message,
  };
  return new InternalServerError(500, _error, message, headers);
};

export const makeBadRequestError = ({
  error,
  headers,
}: MakeOpenAIErrorParams): APIError => {
  const message = error.message ?? "Bad request";
  const _error = {
    ...error,
    type: ERROR_TYPE,
    code: ERROR_CODE.INVALID_REQUEST_ERROR,
    message,
  };
  return new BadRequestError(400, _error, message, headers);
};

export const makeNotFoundError = ({
  error,
  headers,
}: MakeOpenAIErrorParams): APIError => {
  const message = error.message ?? "Not found";
  const _error = {
    ...error,
    type: ERROR_TYPE,
    code: ERROR_CODE.NOT_FOUND_ERROR,
    message,
  };
  return new NotFoundError(404, _error, message, headers);
};

export const makeRateLimitError = ({
  error,
  headers,
}: MakeOpenAIErrorParams): APIError => {
  const message = error.message ?? "Rate limit exceeded";
  const _error = {
    ...error,
    type: ERROR_TYPE,
    code: ERROR_CODE.RATE_LIMIT_ERROR,
    message,
  };
  return new RateLimitError(429, _error, message, headers);
};

// --- ZOD VALIDATION ERROR MESSAGE GENERATION ---
export const generateZodErrorMessage = (error: ZodError) => {
  return generateErrorMessage(error.issues, {
    delimiter: {
      component: " - ",
    },
    path: {
      enabled: true,
      type: "objectNotation",
    },
    code: {
      enabled: false,
    },
    message: {
      enabled: true,
      label: "",
    },
  });
};
