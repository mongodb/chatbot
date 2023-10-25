import request from "supertest";
import { Express } from "express";
import { rateLimitResponse } from "./apiConversationsRouter";
import { DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp } from "../../testHelpers";
import { makeTestAppConfig } from "../../testHelpers";

jest.setTimeout(60000);
describe("Conversations Router", () => {
  const ipAddress = "127.0.0.1";
  //   const addMessageEndpointUrl =
  //     DEFAULT_API_PREFIX + "/conversations/:conversationId/messages";
  const { mongodb, appConfig, mongoClient } = makeTestAppConfig();
  afterAll(async () => {
    // clean up
    await mongodb.dropDatabase();
    await mongoClient.close();
  });

  test("Should apply conversation router rate limit", async () => {
    const { app } = await makeTestApp({
      apiConversationsRouterConfig: {
        ...appConfig.apiConversationsRouterConfig,
        rateLimitConfig: {
          routerRateLimitConfig: {
            windowMs: 5000, // Big window to cover test duration
            max: 1,
          },
        },
      },
    });

    const successRes = await createApiConversationReq(app);
    const rateLimitedRes = await createApiConversationReq(app);

    expect(successRes.status).toBe(200);
    expect(rateLimitedRes.status).toBe(429);
    expect(rateLimitedRes.body).toStrictEqual(rateLimitResponse);
  });

  // TODO: To update
  //   test("Should apply add message endpoint rate limit", async () => {
  //     const { app } = await makeTestApp({
  //       conversationsRouterConfig: {
  //         ...appConfig.conversationsRouterConfig,
  //         rateLimitConfig: {
  //           addMessageRateLimitConfig: {
  //             windowMs: 20000, // Big window to cover test duration
  //             max: 1,
  //           },
  //         },
  //       },
  //     });
  //     const res = await createConversationReq(app);
  //     const conversationId = res.body._id;
  //     const successRes = await createConversationMessageReq(
  //       app,
  //       conversationId,
  //       "what is the current version of mongodb server?"
  //     );
  //     const rateLimitedRes = await createConversationMessageReq(
  //       app,
  //       conversationId,
  //       "what is the current version of mongodb server?"
  //     );
  //     expect(successRes.error).toBeFalsy();
  //     expect(successRes.status).toBe(200);
  //     expect(rateLimitedRes.status).toBe(429);
  //     expect(rateLimitedRes.body).toStrictEqual(rateLimitResponse);
  //   });

  test("Should apply global slow down", async () => {
    let limitReached = false;
    const { app } = await makeTestApp({
      apiConversationsRouterConfig: {
        ...appConfig.apiConversationsRouterConfig,
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
    const successRes = await createApiConversationReq(app);
    const slowedRes = await createApiConversationReq(app);
    expect(successRes.status).toBe(200);
    expect(slowedRes.status).toBe(200);
    expect(limitReached).toBe(true);
  });

  // TODO: TO Update
  //   test("Should apply add message endpoint slow down", async () => {
  //     let limitReached = false;
  //     const { app } = await makeTestApp({
  //       conversationsRouterConfig: {
  //         ...appConfig.conversationsRouterConfig,
  //         rateLimitConfig: {
  //           addMessageSlowDownConfig: {
  //             windowMs: 30000, // big window to cover test duration
  //             delayAfter: 1,
  //             delayMs: 1,
  //             onLimitReached: () => {
  //               limitReached = true;
  //             },
  //           },
  //         },
  //       },
  //     });
  //     const conversationRes = await createConversationReq(app);
  //     const conversationId = conversationRes.body._id;
  //     const successRes = await createConversationMessageReq(
  //       app,
  //       conversationId,
  //       "what is the current version of mongodb server?"
  //     );
  //     const slowedRes = await createConversationMessageReq(
  //       app,
  //       conversationId,
  //       "what is the current version of mongodb server?"
  //     );
  //     expect(conversationRes.status).toBe(200);
  //     expect(successRes.status).toBe(200);
  //     expect(slowedRes.status).toBe(200);
  //     expect(limitReached).toBe(true);
  //   });

  // Helpers
  /**
    Helper function to create a new conversation
   */
  async function createApiConversationReq(app: Express) {
    const createConversationRes = await request(app)
      .post(DEFAULT_API_PREFIX + "/api-conversations")
      .set("X-FORWARDED-FOR", ipAddress)
      .send();
    return createConversationRes;
  }

  // TODO: TO Update
  //   /**
  //     Helper function to create a new message in a conversation
  //    */
  //   async function createConversationMessageReq(
  //     app: Express,
  //     conversationId: string,
  //     message: string
  //   ) {
  //     const createConversationRes = await request(app)
  //       .post(addMessageEndpointUrl.replace(":conversationId", conversationId))
  //       .set("X-FORWARDED-FOR", ipAddress)
  //       .send({ message });
  //     return createConversationRes;
  //   }
});
