import type { Response as ExpressResponse } from "express";
import type { ZodError } from "zod";
import { generateErrorMessage } from "zod-error";
import { logger } from "mongodb-rag-core";

interface ErrorResponseParams {
  reqId: string;
  res: ExpressResponse;
  error: StandardError;
}

export const sendErrorResponse = ({
  reqId,
  res,
  error,
}: ErrorResponseParams) => {
  logger.error({
    reqId,
    message: `Responding with ${error.httpStatus} status and error message: ${error.message}.`,
  });

  if (!res.writableEnded) {
    return res.status(error.httpStatus).json({
      error: {
        type: error.type,
        code: error.code,
        message: error.message,
      },
    });
  }
};

export const generateZodErrorMessage = (error: ZodError) => {
  return generateErrorMessage(error.issues, {
    delimiter: { error: "\n" },
  });
};

/*
  Error object schema based on:
  https://platform.openai.com/docs/api-reference/responses-streaming/error
*/
export const ERROR_TYPE = "error";
export enum ERROR_CODE {
  INVALID_REQUEST_ERROR = "invalid_request_error",
  NOT_FOUND_ERROR = "not_found_error",
  RATE_LIMIT_ERROR = "rate_limit_error",
  SERVER_ERROR = "server_error",
}
export interface StandardError {
  type: typeof ERROR_TYPE;
  code: ERROR_CODE;
  message: string;
  httpStatus: number;
}

export const makeInternalServerError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: ERROR_CODE.SERVER_ERROR,
    httpStatus: 500,
    message,
  };
};

export const makeBadRequestError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: ERROR_CODE.INVALID_REQUEST_ERROR,
    httpStatus: 400,
    message,
  };
};

export const makeNotFoundError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: ERROR_CODE.NOT_FOUND_ERROR,
    httpStatus: 404,
    message,
  };
};

export const makeRateLimitError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: ERROR_CODE.RATE_LIMIT_ERROR,
    httpStatus: 429,
    message,
  };
};
