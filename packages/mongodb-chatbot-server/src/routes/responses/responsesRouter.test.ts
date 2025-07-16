import type { Server } from "http";
import {
  makeTestLocalServer,
  makeOpenAiClient,
  makeCreateResponseRequestStream,
  type Stream,
} from "../../test/testHelpers";
import { makeDefaultConfig } from "../../test/testConfig";
import {
  ERROR_CODE,
  ERROR_TYPE,
  makeBadRequestError,
  type SomeOpenAIAPIError,
} from "./errors";

jest.setTimeout(60000);

describe("Responses Router", () => {
  let server: Server;
  let ipAddress: string;
  let origin: string;

  afterEach(async () => {
    if (server?.listening) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
    jest.clearAllMocks();
  });

  it("should return responses given a valid request", async () => {
    ({ server, ipAddress, origin } = await makeTestLocalServer());

    const openAiClient = makeOpenAiClient(origin, ipAddress);
    const stream = await makeCreateResponseRequestStream(openAiClient);

    await expectValidResponses({ stream });
  });

  it("should return an openai error when handling an unknown error", async () => {
    const errorMessage = "Unknown error";

    const appConfig = await makeDefaultConfig();
    appConfig.responsesRouterConfig.createResponse.generateResponse = () => {
      throw new Error(errorMessage);
    };

    ({ server, ipAddress, origin } = await makeTestLocalServer(appConfig));

    const openAiClient = makeOpenAiClient(origin, ipAddress);
    const stream = await makeCreateResponseRequestStream(openAiClient);

    await expectInvalidResponses({
      stream,
      error: {
        type: ERROR_TYPE,
        code: ERROR_CODE.SERVER_ERROR,
        message: errorMessage,
      },
    });
  });

  it("should return the openai error when service throws an openai error", async () => {
    const errorMessage = "Bad request input";

    const appConfig = await makeDefaultConfig();
    appConfig.responsesRouterConfig.createResponse.generateResponse = () =>
      Promise.reject(
        makeBadRequestError({
          error: new Error(errorMessage),
          headers: {},
        })
      );

    ({ server, ipAddress, origin } = await makeTestLocalServer(appConfig));

    const openAiClient = makeOpenAiClient(origin, ipAddress);
    const stream = await makeCreateResponseRequestStream(openAiClient);

    await expectInvalidResponses({
      stream,
      error: {
        type: ERROR_TYPE,
        code: ERROR_CODE.INVALID_REQUEST_ERROR,
        message: errorMessage,
      },
    });
  });

  it("Should return an openai error when rate limit is hit", async () => {
    const rateLimitErrorMessage = "Error: rate limit exceeded!";

    const appConfig = await makeDefaultConfig();
    appConfig.responsesRouterConfig.rateLimitConfig = {
      routerRateLimitConfig: {
        windowMs: 500000, // Big window to cover test duration
        max: 1, // Only one request should be allowed
        message: rateLimitErrorMessage,
      },
    };

    ({ server, ipAddress, origin } = await makeTestLocalServer(appConfig));

    const openAiClient = makeOpenAiClient(origin, ipAddress);
    const stream = await makeCreateResponseRequestStream(openAiClient);

    try {
      await makeCreateResponseRequestStream(openAiClient);

      fail("expected rate limit error");
    } catch (error) {
      expect((error as SomeOpenAIAPIError).status).toBe(429);
      expect((error as SomeOpenAIAPIError).error).toEqual({
        type: ERROR_TYPE,
        code: ERROR_CODE.RATE_LIMIT_ERROR,
        message: rateLimitErrorMessage,
      });
    }

    await expectValidResponses({ stream });
  });
});

// --- HELPERS ---

interface ExpectValidResponsesParams {
  stream: Stream;
}

const expectValidResponses = async ({ stream }: ExpectValidResponsesParams) => {
  const responses: any[] = [];
  for await (const event of stream) {
    responses.push(event);
  }

  expect(Array.isArray(responses)).toBe(true);
  expect(responses.length).toBe(3);

  expect(responses[0].type).toBe("response.created");
  expect(responses[1].type).toBe("response.in_progress");
  expect(responses[2].type).toBe("response.completed");

  responses.forEach(({ sequence_number, response }, index) => {
    expect(sequence_number).toBe(index);
    expect(typeof response.id).toBe("string");
    expect(response.object).toBe("response");
    expect(response.error).toBeNull();
    expect(response.model).toBe("mongodb-chat-latest");
  });
};

interface ExpectInvalidResponsesParams {
  stream: Stream;
  error: {
    type: string;
    code: string;
    message: string;
  };
}

const expectInvalidResponses = async ({
  stream,
  error,
}: ExpectInvalidResponsesParams) => {
  const responses: any[] = [];
  try {
    for await (const event of stream) {
      responses.push(event);
    }

    fail("expected error");
  } catch (err: any) {
    expect(err.type).toBe(error.type);
    expect(err.code).toBe(error.code);
    expect(err.error.type).toBe(error.type);
    expect(err.error.code).toBe(error.code);
    expect(err.error.message).toBe(error.message);
  }

  expect(Array.isArray(responses)).toBe(true);
  expect(responses.length).toBe(2);

  expect(responses[0].type).toBe("response.created");
  expect(responses[1].type).toBe("response.in_progress");

  expect(responses[0].sequence_number).toBe(0);
  expect(responses[1].sequence_number).toBe(1);
};
