import { OpenAI } from "mongodb-rag-core/openai";
import { DEFAULT_API_PREFIX } from "../../app";
import {
  makeTestLocalServer,
  collectStreamingResponse,
  TEST_OPENAI_API_KEY,
} from "../../test/testHelpers";
import { makeDefaultConfig } from "../../test/testConfig";
import { basicResponsesRequestBody } from "../../test/testConfig";
import { ERROR_CODE, ERROR_TYPE, makeBadRequestError } from "./errors";
import { CreateResponseRequest } from "./createResponse";

jest.setTimeout(60000);

describe("Responses Router", () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  const makeOpenAiClient = (origin: string, ipAddress: string) => {
    return new OpenAI({
      baseURL: origin + DEFAULT_API_PREFIX,
      apiKey: TEST_OPENAI_API_KEY,
      defaultHeaders: {
        Origin: origin,
        "X-Forwarded-For": ipAddress,
      },
    });
  };

  const makeCreateResponseRequest = (
    origin: string,
    ipAddress: string,
    body?: Partial<CreateResponseRequest["body"]>
  ) => {
    const openAiClient = makeOpenAiClient(origin, ipAddress);

    return openAiClient.responses
      .create({
        ...basicResponsesRequestBody,
        ...body,
      })
      .withResponse();
  };

  it("should return 200 given a valid request", async () => {
    const appConfig = await makeDefaultConfig();
    const { server, ipAddress, origin } = await makeTestLocalServer(appConfig);

    const { response } = await makeCreateResponseRequest(origin, ipAddress);

    expect(response.status).toBe(200);

    server.close();
  });

  it("should return 500 when handling an unknown error", async () => {
    const errorMessage = "Unknown error";

    const appConfig = await makeDefaultConfig();
    appConfig.responsesRouterConfig.createResponse.generateResponse = () =>
      Promise.reject(new Error(errorMessage));

    const { server, ipAddress, origin } = await makeTestLocalServer(appConfig);

    const { response } = await makeCreateResponseRequest(origin, ipAddress);
    const results = await collectStreamingResponse(response);

    expect(response.status).toBe(200);
    testErrorResponses({
      responses: results,
      error: openaiStreamErrorData(500, ERROR_CODE.SERVER_ERROR, errorMessage),
    });

    server.close();
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

    const { server, ipAddress, origin } = await makeTestLocalServer(appConfig);

    const { response } = await makeCreateResponseRequest(origin, ipAddress);
    const results = await collectStreamingResponse(response);

    expect(response.status).toBe(200);
    testErrorResponses({
      responses: results,
      error: openaiStreamErrorData(
        400,
        ERROR_CODE.INVALID_REQUEST_ERROR,
        errorMessage
      ),
    });

    server.close();
  });

  test("Should apply responses router rate limit and return an openai error", async () => {
    const rateLimitErrorMessage = "Error: rate limit exceeded!";

    const appConfig = await makeDefaultConfig();
    appConfig.responsesRouterConfig.rateLimitConfig = {
      routerRateLimitConfig: {
        windowMs: 50000, // Big window to cover test duration
        max: 1, // Only one request should be allowed
        message: rateLimitErrorMessage,
      },
    };

    const { server, ipAddress, origin } = await makeTestLocalServer(appConfig);
    const openAiClient = makeOpenAiClient(origin, ipAddress);

    const { response: successRes } = await openAiClient.responses
      .create(basicResponsesRequestBody)
      .withResponse();

    const { response: rateLimitedRes } = await openAiClient.responses
      .create(basicResponsesRequestBody)
      .withResponse();

    const successResults = await collectStreamingResponse(successRes);
    const rateLimitedResults = await collectStreamingResponse(rateLimitedRes);

    expect(successRes.status).toBe(200);
    expect(rateLimitedRes.status).toBe(429);

    testErrorResponses({
      responses: successResults,
      error: openaiStreamErrorData(
        200,
        ERROR_CODE.SERVER_ERROR,
        rateLimitErrorMessage
      ),
    });
    testErrorResponses({
      responses: rateLimitedResults,
      error: openaiStreamErrorData(
        429,
        ERROR_CODE.RATE_LIMIT_ERROR,
        rateLimitErrorMessage
      ),
    });

    server.close();
  });
});

// --- HELPERS ---

const openaiStreamErrorData = (
  httpStatus: number,
  code: ERROR_CODE,
  message: string,
  retryable = false
) => ({
  code,
  message: `${httpStatus} ${message}`,
  retryable,
});

interface TestErrorResponsesParams {
  responses: Array<any>;
  error: {
    code: ERROR_CODE;
    message: string;
    retryable: boolean;
  };
}

const testErrorResponses = ({ responses, error }: TestErrorResponsesParams) => {
  expect(Array.isArray(responses)).toBe(true);
  expect(responses.length).toBe(3);

  expect(responses[0].type).toBe("response.created");
  expect(responses[1].type).toBe("response.in_progress");
  expect(responses[2].type).toBe(ERROR_TYPE);

  expect(responses[0].sequence_number).toBe(0);
  expect(responses[1].sequence_number).toBe(1);
  expect(responses[2].sequence_number).toBe(2);

  expect(responses[2].data).toEqual(error);
};
