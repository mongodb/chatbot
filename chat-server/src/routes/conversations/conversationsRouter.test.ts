import request from "supertest";
import { Express } from "express";
import { rateLimitResponse } from "./conversationsRouter";
import { CONVERSATIONS_API_V1_PREFIX } from "../../app";
import { makeTestApp } from "../../testHelpers";
import { makeTestAppConfig } from "../../testHelpers";

jest.setTimeout(60000);
describe("Conversations Router", () => {
  const ipAddress = "127.0.0.1";
  const addMessageEndpointUrl =
    CONVERSATIONS_API_V1_PREFIX + "/:conversationId/messages";
  const { mongodb, appConfig } = makeTestAppConfig();
  afterAll(async () => {
    // clean up
    await mongodb?.db.dropDatabase();
    await mongodb?.close();
  });

  test("Should apply conversation router rate limit", async () => {
    const { app, origin } = await makeTestApp({
      conversationsRouterConfig: {
        ...appConfig.conversationsRouterConfig,
        rateLimitConfig: {
          routerRateLimitConfig: {
            windowMs: 5000, // Big window to cover test duration
            max: 1,
          },
        },
      },
    });

    const successRes = await createConversationReq({ app, origin });
    const rateLimitedRes = await createConversationReq({ app, origin });

    expect(successRes.status).toBe(200);
    expect(rateLimitedRes.status).toBe(429);
    expect(rateLimitedRes.body).toStrictEqual(rateLimitResponse);
  });
  test("Should apply add message endpoint rate limit", async () => {
    const { app, origin } = await makeTestApp({
      conversationsRouterConfig: {
        ...appConfig.conversationsRouterConfig,
        rateLimitConfig: {
          addMessageRateLimitConfig: {
            windowMs: 20000, // Big window to cover test duration
            max: 1,
          },
        },
      },
    });
    const res = await createConversationReq({ app, origin });
    const conversationId = res.body._id;
    const successRes = await createConversationMessageReq({
      app,
      conversationId,
      origin,
      message: "what is the current version of mongodb server?"
    });
    const rateLimitedRes = await createConversationMessageReq({
      app,
      conversationId,
      origin,
      message: "what is the current version of mongodb server?"
    });
    expect(successRes.error).toBeFalsy();
    expect(successRes.status).toBe(200);
    expect(rateLimitedRes.status).toBe(429);
    expect(rateLimitedRes.body).toStrictEqual(rateLimitResponse);
  });
  test("Should apply global slow down", async () => {
    let limitReached = false;
    const { app, origin } = await makeTestApp({
      conversationsRouterConfig: {
        ...appConfig.conversationsRouterConfig,
        rateLimitConfig: {
          routerSlowDownConfig: {
            windowMs: 10000,
            delayAfter: 1,
            delayMs: 1,
            onLimitReached: () => {
              limitReached = true;
            },
          },
        },
      },
    });
    const successRes = await createConversationReq({ app, origin });
    const slowedRes = await createConversationReq({ app, origin });
    expect(successRes.status).toBe(200);
    expect(slowedRes.status).toBe(200);
    expect(limitReached).toBe(true);
  });
  test("Should apply add message endpoint slow down", async () => {
    let limitReached = false;
    const { app, origin } = await makeTestApp({
      conversationsRouterConfig: {
        ...appConfig.conversationsRouterConfig,
        rateLimitConfig: {
          addMessageSlowDownConfig: {
            windowMs: 30000, // big window to cover test duration
            delayAfter: 1,
            delayMs: 1,
            onLimitReached: () => {
              limitReached = true;
            },
          },
        },
      },
    });
    const conversationRes = await createConversationReq({ app, origin });
    const conversationId = conversationRes.body._id;
    const successRes = await createConversationMessageReq({
      app,
      conversationId,
      origin,
      message: "what is the current version of mongodb server?"
    });
    const slowedRes = await createConversationMessageReq({
      app,
      conversationId,
      origin,
      message: "what is the current version of mongodb server?"
    });
    expect(conversationRes.status).toBe(200);
    expect(successRes.status).toBe(200);
    expect(slowedRes.status).toBe(200);
    expect(limitReached).toBe(true);
  });

  // Helpers
  /**
    Helper function to create a new conversation
   */
  async function createConversationReq({ app, origin }: {app: Express, origin: string}) {
    const createConversationRes = await request(app)
      .post(CONVERSATIONS_API_V1_PREFIX)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send();
    return createConversationRes;
  }
  /**
    Helper function to create a new message in a conversation
   */
  async function createConversationMessageReq({ app, conversationId, message, origin }: {
    app: Express,
    conversationId: string,
    message: string,
    origin: string
  }) {
    const createConversationRes = await request(app)
      .post(addMessageEndpointUrl.replace(":conversationId", conversationId))
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({ message });
    return createConversationRes;
  }
});
