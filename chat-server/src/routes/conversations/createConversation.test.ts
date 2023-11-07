import request from "supertest";
import "dotenv/config";
import { MongoDB } from "chat-core";
import { Conversation } from "../../services/conversations";
import { Express } from "express";
import { ApiConversation } from "./utils";
import { CONVERSATIONS_API_V1_PREFIX } from "../../app";
import { makeTestApp } from "../../testHelpers";

describe("POST /conversations", () => {
  let mongodb: MongoDB;
  let app: Express;
  let origin: string;

  beforeAll(async () => {
    ({ mongodb, app, origin } = await makeTestApp());
  });
  afterAll(async () => {
    await mongodb?.db.dropDatabase();
    await mongodb?.close();
  });

  it("should respond 200 and create a conversation", async () => {
    const res = await request(app)
      .post(CONVERSATIONS_API_V1_PREFIX)
      .set("Origin", origin)
      .send();
    const conversation: ApiConversation = res.body;
    expect(res.statusCode).toEqual(200);

    expect(conversation.messages).toHaveLength(0);
    const count = await mongodb?.db
      .collection<Conversation>("conversations")
      .countDocuments();
    expect(count).toBe(1);
  });

  it("should respond 400 if the Origin header is missing", async () => {
    const res = await request(app).post(CONVERSATIONS_API_V1_PREFIX).send();
    expect(res.statusCode).toEqual(400);
  });
});
