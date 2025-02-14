import { ConversationsService } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { makeTestApp, makeTestAppConfig } from "../../test/testHelpers";
import request from "supertest";
import { AppConfig, DEFAULT_API_PREFIX } from "../../app";
import { ApiConversation } from "./utils";
const CONVERSATIONS_API_V1_PREFIX = DEFAULT_API_PREFIX + "/conversations";

jest.setTimeout(30000);

describe("GET /conversations/:conversationId", () => {
  let appConfig: AppConfig;
  let conversations: ConversationsService;
  beforeAll(async () => {
    ({ appConfig } = await makeTestAppConfig());
    conversations = appConfig.conversationsRouterConfig.conversations;
  });

  it("should return 400 when the conversation ID is invalid", async () => {
    const notObjectId = "not-object-id";
    const { app, origin } = await makeTestApp(appConfig);
    const res = await request(app)
      .get(`${CONVERSATIONS_API_V1_PREFIX}/${notObjectId}`)
      .set("Origin", origin)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "Invalid conversation ID",
    });
  });

  it("should return 200 and the conversation when the conversation is successfully retrieved", async () => {
    const convo = await conversations.create();
    const { app, origin } = await makeTestApp(appConfig);
    const res = await request(app)
      .get(`${CONVERSATIONS_API_V1_PREFIX}/${convo._id.toString()}`)
      .set("Origin", origin)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("_id", convo._id.toString());
    expect(res.body).toHaveProperty("createdAt", convo.createdAt.getTime());
  });

  it("should return 404 when the conversation is not found", async () => {
    const noConvoObjectId = new ObjectId();
    const { app, origin } = await makeTestApp(appConfig);
    const res = await request(app)
      .get(`${CONVERSATIONS_API_V1_PREFIX}/${noConvoObjectId.toString()}`)
      .set("Origin", origin)
      .send();

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      error: "Conversation not found",
    });
  });

  it("should not include system messages or function calls in the response", async () => {
    const convo = await conversations.create();
    await conversations.addManyConversationMessages({
      conversationId: convo._id,
      messages: [
        {
          role: "user",
          content: "Can you do math?",
        },
        {
          role: "assistant",
          content: "Sure I can! What do you need?",
        },
        {
          role: "system",
          content:
            "You are now an expert mathlete. You can add numbers with the addNumbers function.",
        },
        {
          role: "user",
          content: "What is 1 + 2 + 3 + 4 + 5?",
        },
        {
          role: "assistant",
          content: "",
          functionCall: {
            name: "addNumbers",
            arguments: `[1, 2, 3, 4, 5]`,
          },
        },
        {
          role: "function",
          name: "addNumbers",
          content: "15",
        },
        {
          role: "assistant",
          content: "The sum 1 + 2 + 3 + 4 + 5 is equal to 15.",
        },
      ],
    });
    const { app, origin } = await makeTestApp(appConfig);
    const res = await request(app)
      .get(`${CONVERSATIONS_API_V1_PREFIX}/${convo._id.toString()}`)
      .set("Origin", origin)
      .send();
    expect(res.statusCode).toEqual(200);
    const apiConversation = res.body as ApiConversation;
    expect(apiConversation).toHaveProperty("_id", convo._id.toString());
    expect(apiConversation.messages.length).toEqual(4);
    apiConversation.messages.forEach((message) => {
      expect(message.role).not.toEqual("system");
      expect(message.role).not.toEqual("function");
      if (message.role === "assistant") {
        expect(Object.keys(message).includes("functionCall")).toEqual(false);
      }
    });
  });
});
