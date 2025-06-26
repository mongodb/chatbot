/*
  Error object schema based on:
  https://platform.openai.com/docs/api-reference/responses-streaming/error
*/
const ERROR_TYPE = "error";
export interface StandardError {
  type: typeof ERROR_TYPE;
  code: string;
  message: string;
}

export const makeInternalServerError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: "server_error",
    message,
  };
};

export const makeBadRequestError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: "invalid_request_error",
    message,
  };
};

export const makeNotFoundError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: "not_found_error",
    message,
  };
};

export const makeRateLimitError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: "rate_limit_error",
    message,
  };
};

export const makeTokensExceededError = (message: string): StandardError => {
  return {
    type: ERROR_TYPE,
    code: "tokens_exceeded_error",
    message,
  };
};
