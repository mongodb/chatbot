import request from "supertest";
import { AppConfig } from "../../app";
import { DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp } from "../../test/testHelpers";
import { makeTestAppConfig } from "../../test/testHelpers";
import { MONGO_CHAT_MODEL } from "../../test/testConfig";
import { ERROR_TYPE, ERROR_CODE, makeBadRequestError } from "./errors";

jest.setTimeout(60000);

describe("Responses Router", () => {
  const ipAddress = "127.0.0.1";
  const responsesEndpoint = DEFAULT_API_PREFIX + "/responses";
  const validRequestBody = {
    model: MONGO_CHAT_MODEL,
    stream: true,
    input: "What is MongoDB?",
  };
  let appConfig: AppConfig;

  beforeAll(async () => {
    ({ appConfig } = await makeTestAppConfig());
  });

  it("should return 200 given a valid request", async () => {
    const { app, origin } = await makeTestApp({
      ...appConfig,
      responsesRouterConfig: {
        createResponse: {
          supportedModels: [MONGO_CHAT_MODEL],
          maxOutputTokens: 4000,
          generateResponse: () =>
            Promise.resolve({
              messages: [
                { role: "user", content: "What is MongoDB?" },
                { role: "assistant", content: "MongoDB is a database." },
              ],
            }),
        },
      },
    });

    const res = await request(app)
      .post(responsesEndpoint)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send(validRequestBody);

    expect(res.status).toBe(200);
  });

  it("should return 500 when handling an unknown error", async () => {
    const errorMessage = "Unknown error";
    const { app, origin } = await makeTestApp({
      ...appConfig,
      responsesRouterConfig: {
        createResponse: {
          supportedModels: [MONGO_CHAT_MODEL],
          maxOutputTokens: 4000,
          generateResponse: () => Promise.reject(new Error(errorMessage)),
        },
      },
    });

    const res = await request(app)
      .post(responsesEndpoint)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send(validRequestBody);

    expect(res.status).toBe(500);
    expect(res.body.error).toEqual({
      type: ERROR_TYPE,
      code: ERROR_CODE.SERVER_ERROR,
      message: errorMessage,
    });
  });

  it("should return the openai error when service throws an openai error", async () => {
    const errorMessage = "Bad request input";
    const { app, origin } = await makeTestApp({
      ...appConfig,
      responsesRouterConfig: {
        createResponse: {
          supportedModels: [MONGO_CHAT_MODEL],
          maxOutputTokens: 4000,
          generateResponse: () =>
            Promise.reject(
              makeBadRequestError({
                error: new Error(errorMessage),
                headers: {},
              })
            ),
        },
      },
    });

    const res = await request(app)
      .post(responsesEndpoint)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send(validRequestBody);

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({
      type: ERROR_TYPE,
      code: ERROR_CODE.INVALID_REQUEST_ERROR,
      message: errorMessage,
    });
  });

  test("Should apply responses router rate limit", async () => {
    const rateLimitErrorMessage = "Error: rate limit exceeded!";

    const { app, origin } = await makeTestApp({
      responsesRouterConfig: {
        rateLimitConfig: {
          routerRateLimitConfig: {
            windowMs: 50000, // Big window to cover test duration
            max: 1, // Only one request should be allowed
            message: rateLimitErrorMessage,
          },
        },
      },
    });

    const successRes = await request(app)
      .post(responsesEndpoint)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send(validRequestBody);

    const rateLimitedRes = await request(app)
      .post(responsesEndpoint)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send(validRequestBody);

    expect(successRes.status).toBe(200);
    expect(successRes.error).toBeFalsy();

    expect(rateLimitedRes.status).toBe(429);
    expect(rateLimitedRes.error).toBeTruthy();
    expect(rateLimitedRes.body.type).toBe(ERROR_TYPE);
    expect(rateLimitedRes.body.code).toBe(ERROR_CODE.RATE_LIMIT_ERROR);
    expect(rateLimitedRes.body.error.type).toBe(ERROR_TYPE);
    expect(rateLimitedRes.body.error.code).toBe(ERROR_CODE.RATE_LIMIT_ERROR);
    expect(rateLimitedRes.body.error.message).toBe(rateLimitErrorMessage);
  });
});
