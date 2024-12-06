import request from "supertest";
import "dotenv/config";
import { AppConfig } from "../../app";
import { Conversation } from "mongodb-rag-core";
import { ApiConversation } from "./utils";
import { DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp, makeTestAppConfig } from "../../test/testHelpers";
import { Db, ObjectId } from "mongodb-rag-core/mongodb";

const CONVERSATIONS_API_V1_PREFIX = DEFAULT_API_PREFIX + "/conversations";
describe("POST /conversations", () => {
  let appConfig: AppConfig;
  let mongodb: Db;
  beforeAll(async () => {
    ({ appConfig, mongodb } = await makeTestAppConfig());
  });

  it("should respond 200 and create a conversation", async () => {
    const { app, origin } = await makeTestApp(appConfig);
    const res = await request(app)
      .post(CONVERSATIONS_API_V1_PREFIX)
      .set("Origin", origin)
      .send();
    const conversation: ApiConversation = res.body;
    expect(res.statusCode).toEqual(200);

    expect(conversation.messages).toHaveLength(0);
    const count = await mongodb
      .collection<Conversation>("conversations")
      .countDocuments();
    expect(count).toBe(1);
  });
  it("should add custom data to the conversation", async () => {
    const customData = { test: "test" };
    const { app, origin } = await makeTestApp({
      ...appConfig,
      conversationsRouterConfig: {
        ...appConfig.conversationsRouterConfig,
        createConversationCustomData: async () => {
          return customData;
        },
      },
    });
    const res = await request(app)
      .post(CONVERSATIONS_API_V1_PREFIX)
      .set("Origin", origin)
      .send();
    const conversation: ApiConversation = res.body;
    expect(res.statusCode).toEqual(200);
    const conversationInDb = await mongodb
      .collection<Conversation>("conversations")
      .findOne({ _id: ObjectId.createFromHexString(conversation._id) });
    expect(conversationInDb?.customData).toEqual(customData);
  });

  it("should respond 500 if cannot parse the custom data", async () => {
    const { app, origin } = await makeTestApp({
      ...appConfig,
      conversationsRouterConfig: {
        ...appConfig.conversationsRouterConfig,
        createConversationCustomData: async () => {
          throw new Error("Error parsing custom data");
        },
      },
    });
    const res = await request(app)
      .post(CONVERSATIONS_API_V1_PREFIX)
      .set("Origin", origin)
      .send();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      error: "Error parsing custom data from the request",
    });
  });

  it("should respond 500 if cannot create the conversation", async () => {
    const mockConversations = {
      ...appConfig.conversationsRouterConfig.conversations,
      create: jest
        .fn()
        .mockRejectedValue(new Error("Error creating conversation")),
    };
    const { app, origin } = await makeTestApp({
      ...appConfig,
      conversationsRouterConfig: {
        ...appConfig.conversationsRouterConfig,
        conversations: mockConversations,
      },
    });
    const res = await request(app)
      .post(CONVERSATIONS_API_V1_PREFIX)
      .set("Origin", origin)
      .send();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      error: "Error creating conversation",
    });
  });

  it("should respond 400 if neither the Origin nor X-Request-Origin header is present", async () => {
    const { app } = await makeTestApp(appConfig);
    const res = await request(app).post(CONVERSATIONS_API_V1_PREFIX).send();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "You must specify either an Origin or X-Request-Origin header",
    });
  });
});
