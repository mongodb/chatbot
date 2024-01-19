import { strict as assert } from "assert";
import request from "supertest";
import "dotenv/config";
import {
  Conversation,
  Message,
  AssistantMessage,
  ConversationsService,
} from "../../services/ConversationsService";
import { Express } from "express";
import { Db, MongoClient, ObjectId } from "mongodb-rag-core";
import { makeCommentMessageRoute } from "./commentMessage";
import { DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp } from "../../test/testHelpers";
import { AppConfig } from "../../app";

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
  let mongodb: Db;
  let mongoClient: MongoClient;
  let ipAddress: string;
  let appConfig: AppConfig;
  let origin: string;

  beforeAll(async () => {
    ({ mongodb, mongoClient, app, ipAddress, appConfig, origin } =
      await makeTestApp());
    conversations = appConfig.conversationsRouterConfig.conversations;

    app
      .post(endpointUrl, makeCommentMessageRoute({ conversations }))
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin);
    conversation = await conversations.create();
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

  afterAll(async () => {
    await mongodb.dropDatabase();
    await mongoClient.close();
  });

  test("Should return 204 for valid comment", async () => {
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
      .send({ comment: "I didn't rate this response but am trying to comment on it." });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: "Invalid comment" });
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

  test("Should return 400 for invalid conversation ID", async () => {
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
  test("Should return 400 for invalid message ID", async () => {
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
  test("Should return 404 for conversation not in DB", async () => {
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
  test("Should return 404 for message not in conversation", async () => {
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
});
