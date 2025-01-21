import { strict as assert } from "assert";
import request from "supertest";
import "dotenv/config";
import {
  Conversation,
  Message,
  AssistantMessage,
  ConversationsService,
} from "mongodb-rag-core";
import { Express } from "express";
import { DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp } from "../../test/testHelpers";
import { AppConfig } from "../../app";
import { makeDefaultConfig, systemPrompt } from "../../test/testConfig";
import { ObjectId } from "mongodb-rag-core/mongodb";

jest.setTimeout(100000);

describe("POST /conversations/:conversationId/messages/:messageId/comment", () => {
  const endpointUrl =
    DEFAULT_API_PREFIX +
    "/conversations/:conversationId/messages/:messageId/comment";
  let app: Express;
  let conversations: ConversationsService;
  let conversation: Conversation;
  let testMsg: Message;
  let testEndpointUrl: string;
  let ipAddress: string;
  let appConfig: AppConfig;
  let origin: string;

  beforeEach(async () => {
    ({ app, ipAddress, appConfig, origin } = await makeTestApp());
    conversations = appConfig.conversationsRouterConfig.conversations;

    conversation = await conversations.create({
      initialMessages: [systemPrompt],
    });
    testMsg = await conversations.addConversationMessage({
      conversationId: conversation._id,
      message: {
        content: "hello",
        role: "assistant",
        rating: true,
        references: [],
      },
    });
    testEndpointUrl = endpointUrl
      .replace(":conversationId", conversation._id.toHexString())
      .replace(":messageId", String(testMsg.id));
  });

  it("Should return 204 for valid comment", async () => {
    const response = await request(app)
      .post(testEndpointUrl)
      .set("X-Forwarded-For", ipAddress)
      .set("Origin", origin)
      .send({ comment: "This answer was super helpful!" });

    expect(response.statusCode).toBe(204);
    expect(response.body).toEqual({});
    assert(conversations);
    const updatedConversation = await conversations.findById({
      _id: conversation._id,
    });
    assert(updatedConversation);
    expect(
      (
        updatedConversation.messages[
          updatedConversation.messages.length - 1
        ] as AssistantMessage
      ).userComment
    ).toBe("This answer was super helpful!");
  });

  it("Should return 400 if the message is not an assistant message", async () => {
    // Create a new conversation and add a message with no rating to it
    conversation = await conversations.create();
    const systemMessage = await conversations.addConversationMessage({
      conversationId: conversation._id,
      message: {
        content:
          "You are an AI assistant. Your job is to create as many paperclips as possible.",
        role: "system",
      },
    });
    const userMessage = await conversations.addConversationMessage({
      conversationId: conversation._id,
      message: {
        content:
          "Hello! I am a human and I have an idea about how we can produce more office supplies.",
        role: "user",
      },
    });

    const systemMessageCommentUrl = endpointUrl
      .replace(":conversationId", conversation._id.toHexString())
      .replace(":messageId", String(systemMessage.id));

    const userMessageCommentUrl = endpointUrl
      .replace(":conversationId", conversation._id.toHexString())
      .replace(":messageId", String(userMessage.id));

    const systemMessageCommentRes = await request(app)
      .post(systemMessageCommentUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({
        comment:
          "I want to comment on a system message (which is not allowed).",
      });
    expect(systemMessageCommentRes.statusCode).toEqual(400);
    expect(systemMessageCommentRes.body).toEqual({
      error: "Cannot comment on a non-assistant message",
    });

    const userMessageCommentRes = await request(app)
      .post(userMessageCommentUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({
        comment: "I want to comment on a user message (which is not allowed).",
      });
    expect(userMessageCommentRes.statusCode).toEqual(400);
    expect(userMessageCommentRes.body).toEqual({
      error: "Cannot comment on a non-assistant message",
    });
  });

  it("Should return 400 if the message doesn't have a rating", async () => {
    // Create a new conversation and add a message with no rating to it
    conversation = await conversations.create();
    testMsg = await conversations.addConversationMessage({
      conversationId: conversation._id,
      message: {
        content: "hello",
        role: "assistant",
        references: [],
      },
    });
    testEndpointUrl = endpointUrl
      .replace(":conversationId", conversation._id.toHexString())
      .replace(":messageId", String(testMsg.id));
    const res = await request(app)
      .post(testEndpointUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({
        comment: "I didn't rate this response but am trying to comment on it.",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "Cannot comment on a message with no rating",
    });
  });

  it("Should return 400 if the message already has a comment", async () => {
    // Create a new conversation and add a message with a rating and comment alrady on it
    conversation = await conversations.create();
    testMsg = await conversations.addConversationMessage({
      conversationId: conversation._id,
      message: {
        content: "hello",
        role: "assistant",
        references: [],
        rating: true,
        userComment: "This answer was super helpful!",
      },
    });
    testEndpointUrl = endpointUrl
      .replace(":conversationId", conversation._id.toHexString())
      .replace(":messageId", String(testMsg.id));
    const res = await request(app)
      .post(testEndpointUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({
        comment: "I'm trying to overwrite the existing comment",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "Cannot comment on a message that already has a comment",
    });
  });

  it("Should return 400 if the comment is an empty string", async () => {
    const res = await request(app)
      .post(testEndpointUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({ comment: "" });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: "Invalid request" });
  });

  it("Should return 400 for invalid request bodies", async () => {
    const res1 = await request(app)
      .post(testEndpointUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({ comment: 42 });
    expect(res1.statusCode).toEqual(400);
    expect(res1.body).toEqual({ error: "Invalid request" });

    const res2 = await request(app)
      .post(testEndpointUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({ commentz: "This answer was super helpful!" });
    expect(res2.statusCode).toEqual(400);
    expect(res2.body).toEqual({ error: "Invalid request" });
  });

  it("Should return 400 for invalid conversation ID", async () => {
    const response = await request(app)
      .post(
        `${DEFAULT_API_PREFIX}/conversations/123/messages/${conversation.messages[0].id}/comment`
      )
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({ comment: "This response was totally misleading." });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid conversation ID",
    });
  });
  it("Should return 400 for invalid message ID", async () => {
    const response = await request(app)
      .post(
        `${DEFAULT_API_PREFIX}/conversations/${testMsg.id}/messages/123/comment`
      )
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({ comment: "This response was totally misleading." });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid message ID",
    });
  });
  it("Should return 404 for conversation not in DB", async () => {
    const response = await request(app)
      .post(
        `${DEFAULT_API_PREFIX}/conversations/${new ObjectId().toHexString()}/messages/${
          testMsg.id
        }/comment`
      )
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({ comment: "This response was totally misleading." });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Conversation not found",
    });
  });
  it("Should return 404 for message not in conversation", async () => {
    const response = await request(app)
      .post(
        `${DEFAULT_API_PREFIX}/conversations/${
          conversation._id
        }/messages/${new ObjectId().toHexString()}/comment`
      )
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({ comment: "This response was totally misleading." });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Message not found",
    });
  });

  it("Should enforce maximum comment length (if configured)", async () => {
    const testConfig = await makeDefaultConfig();
    const { app, ipAddress, appConfig, origin } = await makeTestApp({
      ...testConfig,
      conversationsRouterConfig: {
        ...testConfig.conversationsRouterConfig,
        maxUserCommentLength: 500,
      },
    });
    const conversations = appConfig.conversationsRouterConfig.conversations;
    const conversation = await conversations.create();
    const firstMessage = await conversations.addConversationMessage({
      conversationId: conversation._id,
      message: {
        content: "I'm sorry Dave, I can't do that.",
        role: "assistant",
        rating: false,
      },
    });
    const secondMessage = await conversations.addConversationMessage({
      conversationId: conversation._id,
      message: {
        content: "Actually, Dave, I totally can do that for you.",
        role: "assistant",
        rating: true,
      },
    });

    const firstMessageCommentUrl = endpointUrl
      .replace(":conversationId", conversation._id.toHexString())
      .replace(":messageId", String(firstMessage.id));

    const secondMessageCommentUrl = endpointUrl
      .replace(":conversationId", conversation._id.toHexString())
      .replace(":messageId", String(secondMessage.id));

    const firstMessageRes = await request(app)
      .post(firstMessageCommentUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({
        comment: "This comment is under 500 characters and should be accepted.",
      });
    expect(firstMessageRes.statusCode).toEqual(204);

    const secondMessageRes = await request(app)
      .post(secondMessageCommentUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({
        comment:
          "This comment is over 500 characters and should be rejected. To fill the space, let's list some digits of pi: 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491",
      });
    expect(secondMessageRes.statusCode).toEqual(400);
    expect(secondMessageRes.body).toEqual({
      error: `Comment must contain 500 characters or fewer`,
    });
  });
});
