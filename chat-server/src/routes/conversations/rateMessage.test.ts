import { strict as assert } from "assert";
import request from "supertest";
import "dotenv/config";
import {
  Conversation,
  Message,
  AssistantMessage,
  ConversationsService,
} from "../../services/conversations";
import { Express } from "express";
import { Db, MongoClient, ObjectId } from "chat-core";
import { makeRateMessageRoute } from "./rateMessage";
import { CONVERSATIONS_API_V1_PREFIX } from "../../app";
import { makeTestApp } from "../../testHelpers";
import { AppConfig } from "../../app";

jest.setTimeout(100000);

describe("POST /conversations/:conversationId/messages/:messageId/rating", () => {
  const endpointUrl =
    CONVERSATIONS_API_V1_PREFIX + "/:conversationId/messages/:messageId/rating";
  let app: Express;
  let conversations: ConversationsService;
  let conversation: Conversation;
  let testMsg: Message;
  let testEndpointUrl: string;
  let mongodb: Db;
  let mongoClient: MongoClient;
  let ipAddress: string;
  let appConfig: AppConfig;

  beforeAll(async () => {
    ({ mongodb, mongoClient, app, ipAddress, appConfig } = await makeTestApp());
    conversations = appConfig.conversationsRouterConfig.conversations;

    app
      .post(endpointUrl, makeRateMessageRoute({ conversations }))
      .set("X-FORWARDED-FOR", ipAddress);
    conversation = await conversations.create({ ipAddress });
    testMsg = await conversations.addConversationMessage({
      conversationId: conversation._id,
      content: "hello",
      role: "assistant",
    });
    testEndpointUrl = endpointUrl
      .replace(":conversationId", conversation._id.toHexString())
      .replace(":messageId", String(testMsg.id));
  });

  afterAll(async () => {
    await mongodb.dropDatabase();
    await mongoClient.close();
  });

  test("Should return 204 for valid rating", async () => {
    const response = await request(app)
      .post(testEndpointUrl)
      .set("X-Forwarded-For", ipAddress)
      .send({ rating: true });

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
      ).rating
    ).toBe(true);
  });

  it("Should return 400 for invalid request bodies", async () => {
    const res1 = await request(app)
      .post(testEndpointUrl)
      .send({ rating: "blue" });
    expect(res1.statusCode).toEqual(400);

    const res2 = await request(app)
      .post(testEndpointUrl)
      .send({ ratingz: true });
    expect(res2.statusCode).toEqual(400);
  });
  test("Should return 400 for invalid conversation ID", async () => {
    const response = await request(app)
      .post(
        `${CONVERSATIONS_API_V1_PREFIX}/123/messages/${conversation.messages[0].id}/rating`
      )
      .set("X-FORWARDED-FOR", ipAddress)
      .send({ rating: true });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid conversation ID",
    });
  });
  test("Should return 400 for invalid message ID", async () => {
    const response = await request(app)
      .post(`${CONVERSATIONS_API_V1_PREFIX}/${testMsg.id}/messages/123/rating`)
      .set("X-FORWARDED-FOR", ipAddress)
      .send({ rating: true });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid message ID",
    });
  });
  test("Should return 404 for conversation not in DB", async () => {
    const response = await request(app)
      .post(
        `${CONVERSATIONS_API_V1_PREFIX}/${new ObjectId().toHexString()}/messages/${
          testMsg.id
        }/rating`
      )
      .set("X-FORWARDED-FOR", ipAddress)
      .send({ rating: true });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Conversation not found",
    });
  });
  test("Should return 404 for message not in conversation", async () => {
    const response = await request(app)
      .post(
        `${CONVERSATIONS_API_V1_PREFIX}/${
          conversation._id
        }/messages/${new ObjectId().toHexString()}/rating`
      )
      .set("X-FORWARDED-FOR", ipAddress)
      .send({ rating: true });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Message not found",
    });
  });
});
