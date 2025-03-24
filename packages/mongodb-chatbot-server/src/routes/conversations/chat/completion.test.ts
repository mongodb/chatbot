import request from "supertest";
import "dotenv/config";
import {
  assertEnvVars,
  CORE_ENV_VARS,
  ConversationsService,
} from "mongodb-rag-core";
import { Express } from "express";
import {
  ChatCompletionRequestBody,
  DEFAULT_MAX_INPUT_LENGTH,
  DEFAULT_MAX_MESSAGES,
} from "./completion";
import { ApiMessage } from "../utils";
import { DEFAULT_API_PREFIX } from "../../../app";
import { makeTestApp } from "../../../test/testHelpers";
import { AppConfig } from "../../../app";
import { Db } from "mongodb-rag-core/mongodb";

const { OPENAI_CHAT_COMPLETION_DEPLOYMENT } = assertEnvVars(CORE_ENV_VARS);
jest.setTimeout(100000);

describe("POST /chat/completions", () => {
  let mongodb: Db;
  let ipAddress: string;
  let origin: string;
  let conversations: ConversationsService;
  let app: Express;
  let appConfig: AppConfig;
  const mockCustomDataFunction = jest.fn();

  beforeAll(async () => {
    ({ ipAddress, origin, app, appConfig, mongodb } = await makeTestApp({
      conversationsRouterConfig: {
        createConversationCustomData: mockCustomDataFunction,
      },
    }));
    ({
      conversationsRouterConfig: { conversations },
    } = appConfig);
  });

  const endpointUrl = DEFAULT_API_PREFIX + "/conversations/chat/completions";

  describe("Awaited response", () => {
    it("should respond with 200 and return an assistant message", async () => {
      const requestBody: ChatCompletionRequestBody = {
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "How can I use MongoDB to build my new mobile app?",
          },
        ],
      };
      const res = await request(app)
        .post(endpointUrl)
        .set("X-FORWARDED-FOR", ipAddress)
        .set("Origin", origin)
        .set("req-id", "test-req-id")
        .send(requestBody);

      const message: ApiMessage = res.body;
      console.log(res.body);
      expect(res.statusCode).toEqual(200);
      expect(message.role).toBe("assistant");
      expect(message.content).toContain("MongoDB");
    });
  });

  describe("Streamed response", () => {
    it("should respond with a 200 text/event-stream that streams the response", async () => {
      const requestBody: ChatCompletionRequestBody = {
        messages: [
          {
            role: "user",
            content: "What are the benefits of MongoDB Atlas?",
          },
        ],
      };

      const res = await request(app)
        .post(`${endpointUrl}?stream=true`)
        .set("Origin", origin)
        .set("req-id", "test-req-id")
        .send(requestBody);

      expect(res.statusCode).toEqual(200);
      expect(res.header["content-type"]).toBe("text/event-stream");
      expect(res.text).toContain(`data: {"type":"delta","data":"`);
      expect(res.text).toContain(`data: {"type":"finished","data":"`);
    });

    it("should stream two requests concurrently", async () => {
      const requestBody1: ChatCompletionRequestBody = {
        messages: [
          {
            role: "user",
            content: "What is MongoDB Atlas?",
          },
        ],
      };

      const requestBody2: ChatCompletionRequestBody = {
        messages: [
          {
            role: "user",
            content: "How does MongoDB handle sharding?",
          },
        ],
      };

      // Run requests concurrently
      const [res1, res2] = await Promise.all([
        request(app)
          .post(`${endpointUrl}?stream=true`)
          .set("Origin", origin)
          .set("req-id", "test-req-id-1")
          .send(requestBody1),
        request(app)
          .post(`${endpointUrl}?stream=true`)
          .set("Origin", origin)
          .set("req-id", "test-req-id-2")
          .send(requestBody2),
      ]);

      expect(res1.statusCode).toEqual(200);
      expect(res2.statusCode).toEqual(200);
      expect(res1.header["content-type"]).toBe("text/event-stream");
      expect(res2.header["content-type"]).toBe("text/event-stream");
    });
  });

  describe("Error handling", () => {
    test("should respond 400 if message is too long", async () => {
      // Create a message that exceeds the max input length
      const longContent = "a".repeat(DEFAULT_MAX_INPUT_LENGTH + 1);

      const requestBody: ChatCompletionRequestBody = {
        messages: [
          {
            role: "user",
            content: longContent,
          },
        ],
      };

      const res = await request(app)
        .post(endpointUrl)
        .set("Origin", origin)
        .set("req-id", "test-req-id")
        .send(requestBody);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Message too long");
    });

    test("should respond 400 if too many messages", async () => {
      // Create a request with more than the max allowed messages
      const messages = Array.from(
        { length: DEFAULT_MAX_MESSAGES + 1 },
        (_, i) => ({
          role: i % 2 === 0 ? "user" : ("assistant" as const),
          content: `Message ${i}`,
        })
      ) satisfies ChatCompletionRequestBody["messages"];

      const requestBody: ChatCompletionRequestBody = {
        messages,
      };

      const res = await request(app)
        .post(endpointUrl)
        .set("Origin", origin)
        .set("req-id", "test-req-id")
        .send(requestBody);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Conversation too long");
    });

    test("should respond 400 if missing req-id header", async () => {
      const requestBody: ChatCompletionRequestBody = {
        messages: [
          {
            role: "user",
            content: "What is MongoDB?",
          },
        ],
      };

      const res = await request(app)
        .post(endpointUrl)
        .set("Origin", origin)
        // Intentionally not setting req-id
        .send(requestBody);

      expect(res.statusCode).toEqual(400);
    });
  });
});
