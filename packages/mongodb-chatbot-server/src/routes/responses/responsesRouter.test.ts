import type { Express } from "express";
import request from "supertest";
import { AppConfig } from "../../app";
import { DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp } from "../../test/testHelpers";
import { makeTestAppConfig } from "../../test/testHelpers";
import { basicResponsesRequestBody } from "../../test/testConfig";
import { ERROR_TYPE, ERROR_CODE, makeBadRequestError } from "./errors";
import { CreateResponseRequest } from "./createResponse";

jest.setTimeout(60000);

describe("Responses Router", () => {
  const ipAddress = "127.0.0.1";
  const responsesEndpoint = DEFAULT_API_PREFIX + "/responses";
  let appConfig: AppConfig;

  beforeAll(async () => {
    ({ appConfig } = await makeTestAppConfig());
  });

  const makeCreateResponseRequest = (
    app: Express,
    origin: string,
    body?: Partial<CreateResponseRequest["body"]>
  ) => {
    return request(app)
      .post(responsesEndpoint)
      .set("X-Forwarded-For", ipAddress)
      .set("Origin", origin)
      .send({ ...basicResponsesRequestBody, ...body });
  };

  it("should return 200 given a valid request", async () => {
    const { app, origin } = await makeTestApp(appConfig);

    const res = await makeCreateResponseRequest(app, origin);

    expect(res.status).toBe(200);
  });

  it("should return 500 when handling an unknown error", async () => {
    const errorMessage = "Unknown error";
    const { app, origin } = await makeTestApp({
      ...appConfig,
      responsesRouterConfig: {
        ...appConfig.responsesRouterConfig,
        createResponse: {
          ...appConfig.responsesRouterConfig.createResponse,
          generateResponse: () => Promise.reject(new Error(errorMessage)),
        },
      },
    });

    const res = await makeCreateResponseRequest(app, origin);

    expect(res.status).toBe(500);
    expect(res.body.type).toBe(ERROR_TYPE);
    expect(res.body.code).toBe(ERROR_CODE.SERVER_ERROR);
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
        ...appConfig.responsesRouterConfig,
        createResponse: {
          ...appConfig.responsesRouterConfig.createResponse,
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

    const res = await makeCreateResponseRequest(app, origin);

    expect(res.status).toBe(400);
    expect(res.body.type).toBe(ERROR_TYPE);
    expect(res.body.code).toBe(ERROR_CODE.INVALID_REQUEST_ERROR);
    expect(res.body.error).toEqual({
      type: ERROR_TYPE,
      code: ERROR_CODE.INVALID_REQUEST_ERROR,
      message: errorMessage,
    });
  });

  test("Should apply responses router rate limit and return an openai error", async () => {
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

    const successRes = await makeCreateResponseRequest(app, origin);
    const rateLimitedRes = await makeCreateResponseRequest(app, origin);

    expect(successRes.status).toBe(200);
    expect(successRes.error).toBeFalsy();

    expect(rateLimitedRes.status).toBe(429);
    expect(rateLimitedRes.error).toBeTruthy();
    expect(rateLimitedRes.body.type).toBe(ERROR_TYPE);
    expect(rateLimitedRes.body.code).toBe(ERROR_CODE.RATE_LIMIT_ERROR);
    expect(rateLimitedRes.body.error).toEqual({
      type: ERROR_TYPE,
      code: ERROR_CODE.RATE_LIMIT_ERROR,
      message: rateLimitErrorMessage,
    });
    expect(rateLimitedRes.body.headers["x-forwarded-for"]).toBe(ipAddress);
    expect(rateLimitedRes.body.headers["origin"]).toBe(origin);
  });
});
