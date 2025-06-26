/*
  Error object schema based on:
  https://platform.openai.com/docs/api-reference/responses-streaming/error
*/
const ERROR_TYPE = "error";
export interface StandardError {
  type: typeof ERROR_TYPE;
  code: string;
  message: string;
  httpStatus: number;
}

export const makeInternalServerError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: "server_error",
    httpStatus: 500,
    message,
  };
};

export const makeBadRequestError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: "invalid_request_error",
    httpStatus: 400,
    message,
  };
};

export const makeNotFoundError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: "not_found_error",
    httpStatus: 404,
    message,
  };
};

export const makeRateLimitError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: "rate_limit_error",
    httpStatus: 429,
    message,
  };
};
