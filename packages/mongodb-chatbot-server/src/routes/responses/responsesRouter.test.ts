import type { Server } from "http";
import {
  makeTestLocalServer,
  makeOpenAiClient,
  makeCreateResponseRequest,
  formatOpenAIStreamError,
  collectStreamingResponse,
  type OpenAIStreamError,
} from "../../test/testHelpers";
import {
  basicResponsesRequestBody,
  makeDefaultConfig,
} from "../../test/testConfig";
import { ERROR_CODE, ERROR_TYPE, makeBadRequestError } from "./errors";

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

  it("should return 200 given a valid request", async () => {
    ({ server, ipAddress, origin } = await makeTestLocalServer());

    const openAiClient = makeOpenAiClient(origin, ipAddress);
    const { response } = await makeCreateResponseRequest(openAiClient);
    const results = await collectStreamingResponse(response);

    expect(response.status).toBe(200);
    testResponses({ responses: results });
  });

  it("should return 500 when handling an unknown error", async () => {
    const errorMessage = "Unknown error";

    const appConfig = await makeDefaultConfig();
    appConfig.responsesRouterConfig.createResponse.generateResponse = () => {
      throw new Error(errorMessage);
    };

    ({ server, ipAddress, origin } = await makeTestLocalServer(appConfig));

    const openAiClient = makeOpenAiClient(origin, ipAddress);
    const { response } = await makeCreateResponseRequest(openAiClient);
    const results = await collectStreamingResponse(response);

    expect(response.status).toBe(200);
    testErrorResponses({
      responses: results,
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
    const results = await collectStreamingResponse(response);

    expect(response.status).toBe(200);
    testErrorResponses({
      responses: results,
      error: formatOpenAIStreamError(
        400,
        ERROR_CODE.INVALID_REQUEST_ERROR,
        errorMessage
      ),
    });
  });

  it.skip("Should apply responses router rate limit and return an openai error", async () => {
    const rateLimitErrorMessage = "Error: rate limit exceeded!";

    const appConfig = await makeDefaultConfig();
    appConfig.responsesRouterConfig.rateLimitConfig = {
      routerRateLimitConfig: {
        windowMs: 50000, // Big window to cover test duration
        max: 1, // Only one request should be allowed
        message: rateLimitErrorMessage,
      },
    };

    ({ server, ipAddress, origin } = await makeTestLocalServer(appConfig));

    const openAiClient = makeOpenAiClient(origin, ipAddress);

    const { response: successRes } = await openAiClient.responses
      .create(basicResponsesRequestBody)
      .withResponse();

    const { response: rateLimitedRes } = await openAiClient.responses
      .create(basicResponsesRequestBody)
      .withResponse();

    const successResults = await collectStreamingResponse(successRes);
    const rateLimitedResults = await collectStreamingResponse(rateLimitedRes);

    console.log({ successResults, rateLimitedResults });

    expect(successRes.status).toBe(200);
    expect(rateLimitedRes.status).toBe(429);

    testErrorResponses({
      responses: successResults,
      error: formatOpenAIStreamError(
        200,
        ERROR_CODE.SERVER_ERROR,
        rateLimitErrorMessage
      ),
    });
    testErrorResponses({
      responses: rateLimitedResults,
      error: formatOpenAIStreamError(
        429,
        ERROR_CODE.RATE_LIMIT_ERROR,
        rateLimitErrorMessage
      ),
    });
  });
});

// --- HELPERS ---

interface TestResponsesParams {
  responses: Array<any>;
}

const testResponses = ({ responses }: TestResponsesParams) => {
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

interface TestErrorResponsesParams {
  responses: Array<any>;
  error: OpenAIStreamError;
}

const testErrorResponses = ({ responses, error }: TestErrorResponsesParams) => {
  expect(Array.isArray(responses)).toBe(true);
  expect(responses.length).toBe(3);

  expect(responses[0].type).toBe("response.created");
  expect(responses[1].type).toBe("response.in_progress");
  expect(responses[2].type).toBe(ERROR_TYPE);

  responses.forEach(({ sequence_number }, index) => {
    expect(sequence_number).toBe(index);
  });

  expect(responses[2].data).toEqual(error);
};
