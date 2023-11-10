import request from "supertest";
import "dotenv/config";
import { Db, MongoClient } from "mongodb-rag-core";
import { Conversation } from "../../services/conversations";
import { Express } from "express";
import { ApiConversation } from "./utils";
import { DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp } from "../../test/testHelpers";

const CONVERSATIONS_API_V1_PREFIX = DEFAULT_API_PREFIX + "/conversations";

describe("POST /conversations", () => {
  let mongodb: Db;
  let mongoClient: MongoClient;
  let app: Express;
  let origin: string;

  beforeAll(async () => {
    ({ mongodb, app, mongoClient, origin } = await makeTestApp());
  });
  afterAll(async () => {
    await mongodb.dropDatabase();
    await mongoClient.close();
  });

  it("should respond 200 and create a conversation", async () => {
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

  it("should respond 400 if the Origin header is missing", async () => {
    const res = await request(app).post(CONVERSATIONS_API_V1_PREFIX).send();
    expect(res.statusCode).toEqual(400);
  });
});
