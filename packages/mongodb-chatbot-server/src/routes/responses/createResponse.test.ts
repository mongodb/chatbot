import "dotenv/config";
import request from "supertest";
import { Express } from "express";
import { DEFAULT_API_PREFIX, type AppConfig } from "../../app";
import { makeTestApp } from "../../test/testHelpers";
import { basicResponsesRequestBody } from "../../test/testConfig";
import { ERROR_TYPE, ERROR_CODE } from "./errors";
import { ERR_MSG } from "./createResponse";

jest.setTimeout(100000);

const badRequestError = (message: string) => ({
  type: ERROR_TYPE,
  code: ERROR_CODE.INVALID_REQUEST_ERROR,
  message,
});

describe("POST /responses", () => {
  const endpointUrl = `${DEFAULT_API_PREFIX}/responses`;
  let app: Express;
  let appConfig: AppConfig;
  let ipAddress: string;
  let origin: string;

  beforeEach(async () => {
    ({ app, ipAddress, origin, appConfig } = await makeTestApp());
  });

  describe("Valid requests", () => {
    it("Should return 200 given a string input", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send(basicResponsesRequestBody);

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 given a message array input", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          input: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "What is MongoDB?" },
            { role: "assistant", content: "MongoDB is a document database." },
            { role: "user", content: "What is a document database?" },
          ],
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 given a valid request with instructions", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          instructions: "You are a helpful chatbot.",
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with valid max_output_tokens", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          max_output_tokens: 4000,
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with valid metadata", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          metadata: { key1: "value1", key2: "value2" },
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with valid temperature", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          temperature: 0,
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with previous_response_id", async () => {
      const conversation =
        await appConfig.conversationsRouterConfig.conversations.create({
          initialMessages: [{ role: "user", content: "What is MongoDB?" }],
        });
      const previousResponseId = conversation.messages[0].id;

      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          previous_response_id: previousResponseId,
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with user", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          user: "some-user-id",
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with store=false", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          store: false,
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with store=true", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          store: true,
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with tools and tool_choice", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          tools: [
            {
              name: "test-tool",
              description: "A tool for testing.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string" },
                },
                required: ["query"],
              },
            },
          ],
          tool_choice: "auto",
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with a specific function tool_choice", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          tools: [
            {
              name: "test-tool",
              description: "A tool for testing.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string" },
                },
                required: ["query"],
              },
            },
          ],
          tool_choice: {
            type: "function",
            name: "test-tool",
          },
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 given a message array with function_call", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          input: [
            { role: "user", content: "What is MongoDB?" },
            {
              type: "function_call",
              id: "call123",
              name: "my_function",
              arguments: `{"query": "value"}`,
              status: "in_progress",
            },
          ],
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 given a message array with function_call_output", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          input: [
            { role: "user", content: "What is MongoDB?" },
            {
              type: "function_call_output",
              call_id: "call123",
              output: `{"result": "success"}`,
              status: "completed",
            },
          ],
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with tool_choice 'none'", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          tool_choice: "none",
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with tool_choice 'only'", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          tool_choice: "only",
        });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with an empty tools array", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          tools: [],
        });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("Invalid requests", () => {
    it("Should return 400 with an empty input string", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          input: "",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(`Path: body.input - ${ERR_MSG.INPUT_STRING}`)
      );
    });

    it("Should return 400 with an empty message array", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          input: [],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(`Path: body.input - ${ERR_MSG.INPUT_ARRAY}`)
      );
    });

    it("Should return 400 if model is not mongodb-chat-latest", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          model: "gpt-4o-mini",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(ERR_MSG.MODEL_NOT_SUPPORTED("gpt-4o-mini"))
      );
    });

    it("Should return 400 if stream is not true", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          stream: false,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(`Path: body.stream - ${ERR_MSG.STREAM}`)
      );
    });

    it("Should return 400 if max_output_tokens is > 4000", async () => {
      const max_output_tokens = 4001;

      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          max_output_tokens,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(ERR_MSG.MAX_OUTPUT_TOKENS(max_output_tokens, 4000))
      );
    });

    it("Should return 400 if metadata has too many fields", async () => {
      const metadata: Record<string, string> = {};
      for (let i = 0; i < 17; i++) {
        metadata[`key${i}`] = "value";
      }
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          metadata,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(`Path: body.metadata - ${ERR_MSG.METADATA_LENGTH}`)
      );
    });

    it("Should return 400 if metadata value is too long", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          metadata: { key1: "a".repeat(513) },
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(
          "Path: body.metadata.key1 - String must contain at most 512 character(s)"
        )
      );
    });

    it("Should return 400 if temperature is not 0", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          temperature: 0.5,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(`Path: body.temperature - ${ERR_MSG.TEMPERATURE}`)
      );
    });

    it("Should return 400 if messages contain an invalid role", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          input: [
            { role: "user", content: "What is MongoDB?" },
            { role: "invalid-role", content: "This is an invalid role." },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError("Path: body.input - Invalid input")
      );
    });

    it("Should return 400 if function_call has an invalid status", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          input: [
            {
              type: "function_call",
              id: "call123",
              name: "my_function",
              arguments: `{"query": "value"}`,
              status: "invalid_status",
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError("Path: body.input - Invalid input")
      );
    });

    it("Should return 400 if function_call_output has an invalid status", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          input: [
            {
              type: "function_call_output",
              call_id: "call123",
              output: `{"result": "success"}`,
              status: "invalid_status",
            },
          ],
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError("Path: body.input - Invalid input")
      );
    });

    it("Should return 400 with an invalid tool_choice string", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          tool_choice: "invalid_choice",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError("Path: body.tool_choice - Invalid input")
      );
    });

    it("Should return 400 if max_output_tokens is negative", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          ...basicResponsesRequestBody,
          max_output_tokens: -1,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(
          "Path: body.max_output_tokens - Number must be greater than or equal to 0"
        )
      );
    });
  });
});
