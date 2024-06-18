export class RetriableError<Data extends object = object> extends Error {
  retryAfter: number;
  data?: Data;

  constructor(
    message: string,
    config: { retryAfter?: number; data?: Data } = {}
  ) {
    const { retryAfter = 1000, data } = config;
    super(message);
    this.name = "RetriableError";
    this.message = message;
    this.retryAfter = retryAfter;
    this.data = data;
  }
}

export class TimeoutError<Data extends object = object> extends Error {
  data?: Data;

  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
    this.message = message;
  }
}
