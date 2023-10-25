import request from "supertest";
import "dotenv/config";
import { Db, MongoClient } from "chat-core";
import { Express } from "express";
import { ConversationForApi } from "../utils";
import { DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp } from "../../testHelpers";
import { ApiConversation } from "../../services/ApiConversations";

describe("POST /api-conversations", () => {
  let mongodb: Db;
  let mongoClient: MongoClient;
  let app: Express;

  beforeAll(async () => {
    ({ mongodb, app, mongoClient } = await makeTestApp());
  });
  afterAll(async () => {
    await mongodb.dropDatabase();
    await mongoClient.close();
  });

  it("should respond with 200 and create a conversation", async () => {
    const res = await request(app)
      .post(DEFAULT_API_PREFIX + "/api-conversations")
      .send();
    const apiConversation: ConversationForApi = res.body;
    expect(res.statusCode).toEqual(200);

    expect(apiConversation.messages).toHaveLength(0);
    const count = await mongodb
      .collection<ApiConversation>("conversations")
      .countDocuments();
    expect(count).toBe(1);
  });
});
