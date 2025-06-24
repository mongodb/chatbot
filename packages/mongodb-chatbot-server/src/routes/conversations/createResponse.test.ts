import "dotenv/config";
import request from "supertest";
import { Express } from "express";
import { DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp } from "../../test/testHelpers";

jest.setTimeout(100000);

describe("POST /conversations/completion", () => {
  const endpointUrl = `${DEFAULT_API_PREFIX}/conversations/completion`;
  let app: Express;
  let ipAddress: string;
  let origin: string;

  beforeEach(async () => {
    ({ app, ipAddress, origin } = await makeTestApp());
  });

  describe("Valid requests", () => {
    it("Should return 200 given a string input", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          model: "mongodb-chat-latest",
          stream: true,
          input: "What is MongoDB?",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });

    it("Should return 200 given a message array input", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          model: "mongodb-chat-latest",
          stream: true,
          input: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "What is MongoDB?" },
            { role: "assistant", content: "MongoDB is a document database." },
            { role: "user", content: "What is a document database?" },
          ],
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });
  });

  describe("Invalid requests", () => {
    it("Should return 400 if model is not mongodb-chat-latest", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          model: "gpt-4o-mini",
          stream: true,
          input: "What is MongoDB?",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: "Invalid request" });
    });

    it("Should return 400 if stream is not true", async () => {
      const response = await request(app)
        .post(endpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          model: "mongodb-chat-latest",
          stream: false,
          input: "What is MongoDB?",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: "Invalid request" });
    });
  });
});
