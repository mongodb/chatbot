import request from "supertest";
import "dotenv/config";
import { MongoDB } from "../../src/integrations/mongodb";
import {
  ASSISTANT_PROMPT,
  OpenAiChatClient,
  OpenAiEmbeddingsClient,
  SYSTEM_PROMPT,
} from "../../src/integrations/openai";
import {
  ContentService,
  ContentServiceOptions,
} from "../../src/services/content";
import { ConversationsService } from "../../src/services/conversations";
import { DataStreamerService } from "../../src/services/dataStreamer";
import {
  EmbeddingService,
  OpenAiEmbeddingProvider,
} from "../../src/services/embeddings";
import { makeCreateConversationRoute } from "../../src/routes/conversations/createConversation";
import express from "express";
import { ConversationResponse } from "../../src/routes/conversations/utils";

const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } = process.env;

const mongodb = new MongoDB(MONGODB_CONNECTION_URI!, MONGODB_DATABASE_NAME!);

const testConversationDb = mongodb.mongoClient.db(
  `conversations-test-${Date.now()}`
);
const conversations = new ConversationsService(testConversationDb);

describe("Conversations Router", () => {
  afterAll(async () => {
    await testConversationDb.dropDatabase();
    await mongodb.close();
  });

  const app = express();
  app.use(express.json()); // for parsing application/json

  // create route with mock service
  describe("POST /conversations/", () => {
    app.post("/conversations/", makeCreateConversationRoute({ conversations }));
    it("should respond with 204 and create a conversation", async () => {
      const before = Date.now();
      const res = await request(app).post("/conversations/").send();
      const conversation: ConversationResponse = res.body.conversation;
      console.log({ conversation });
      const [assistantMessage] = conversation.messages;
      expect(res.statusCode).toEqual(200);

      expect(conversation.messages).toHaveLength(1);
      expect(typeof assistantMessage.id).toBe("string");
      expect(assistantMessage.content).toBe(ASSISTANT_PROMPT.content);
      expect(assistantMessage.role).toBe(ASSISTANT_PROMPT.role);
      expect(assistantMessage.rating).toBe(undefined);
      expect(assistantMessage.timeCreated).toBeGreaterThan(before);
    });
  });
});
