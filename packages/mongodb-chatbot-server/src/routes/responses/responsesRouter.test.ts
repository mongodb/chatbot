import request from "supertest";
import { AppConfig } from "../../app";
import { DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp } from "../../test/testHelpers";
import { makeTestAppConfig } from "../../test/testHelpers";

jest.setTimeout(60000);

describe("Responses Router", () => {
  const ipAddress = "127.0.0.1";
  const responsesEndpoint = DEFAULT_API_PREFIX + "/responses";
  const validRequestBody = {
    model: "mongodb-chat-latest",
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
        responses: {
          generateResponse: () => null,
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
});
