import type { Server } from "http";
import type { Response } from "mongodb-rag-core/openai";
import {
  makeTestLocalServer,
  makeOpenAiClient,
  makeCreateResponseRequest,
  formatOpenAIStreamError,
  collectStreamingResponse,
} from "../../test/testHelpers";
import {
  basicResponsesRequestBody,
  makeDefaultConfig,
} from "../../test/testConfig";
import {
  ERROR_CODE,
  ERROR_TYPE,
  makeBadRequestError,
  type OpenAIStreamErrorInput,
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
    const { response } = await makeCreateResponseRequest(openAiClient);

    await expectValidResponses({ response });
  });

  it("should return an openai error when handling an unknown error", async () => {
    const errorMessage = "Unknown error";

    const appConfig = await makeDefaultConfig();
    appConfig.responsesRouterConfig.createResponse.generateResponse = () => {
      throw new Error(errorMessage);
    };

    ({ server, ipAddress, origin } = await makeTestLocalServer(appConfig));

    const openAiClient = makeOpenAiClient(origin, ipAddress);
    const { response } = await makeCreateResponseRequest(openAiClient);

    await expectInvalidResponses({
      response,
      error: formatOpenAIStreamError(
        500,
        ERROR_CODE.SERVER_ERROR,
        errorMessage
      ),
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
    const { response } = await makeCreateResponseRequest(openAiClient);

    await expectInvalidResponses({
      response,
      error: formatOpenAIStreamError(
        400,
        ERROR_CODE.INVALID_REQUEST_ERROR,
        errorMessage
      ),
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

    const { response } = await openAiClient.responses
      .create(basicResponsesRequestBody)
      .withResponse();

    try {
      await openAiClient.responses
        .create(basicResponsesRequestBody)
        .withResponse();
      // should never get here
      expect(true).toBe(false);
    } catch (error) {
      expect((error as { error: OpenAIStreamErrorInput }).error).toEqual({
        type: ERROR_TYPE,
        code: ERROR_CODE.RATE_LIMIT_ERROR,
        message: rateLimitErrorMessage,
      });
    }

    await expectValidResponses({ response });
  });
});

// --- HELPERS ---

interface ExpectValidResponsesParams {
  response: Response;
}

const expectValidResponses = async ({
  response,
}: ExpectValidResponsesParams) => {
  const responses = await collectStreamingResponse(response);

  expect(response.status).toBe(200);
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
  response: Response;
  error: OpenAIStreamErrorInput;
}

const expectInvalidResponses = async ({
  response,
  error,
}: ExpectInvalidResponsesParams) => {
  const responses = await collectStreamingResponse(response);

  expect(response.status).toBe(200);
  expect(Array.isArray(responses)).toBe(true);
  expect(responses.length).toBe(3);

  expect(responses[0].type).toBe("response.created");
  expect(responses[1].type).toBe("response.in_progress");
  expect(responses[2].type).toBe(ERROR_TYPE);

  expect(responses[0].sequence_number).toBe(0);
  expect(responses[1].sequence_number).toBe(1);

  expect(responses[2]).toEqual({
    ...error,
    sequence_number: 2,
  });
};
