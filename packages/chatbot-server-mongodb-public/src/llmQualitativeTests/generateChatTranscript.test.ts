import { Express } from "express";
import {
  ConversationsService,
  AppConfig,
  DEFAULT_API_PREFIX,
} from "mongodb-chatbot-server";
import { makeTestApp } from "../test/testHelpers";
import { generateTranscript } from "./generateChatTranscript";
import { stripIndents } from "common-tags";

let app: Express;
let conversations: ConversationsService;
let ipAddress: string;
let appConfig: AppConfig;
const addMessageEndpoint =
  DEFAULT_API_PREFIX +
  "/conversations/:conversationId/messages?streaming=false";

jest.setTimeout(20000);
beforeAll(async () => {
  ({ app, appConfig, ipAddress } = await makeTestApp());
  conversations = appConfig.conversationsRouterConfig.conversations;
});
describe("generateChatTranscript()", () => {
  test("Should generate a transcript when 1 message", async () => {
    const transcript = await generateTranscript({
      app,
      conversations,
      ipAddress,
      endpoint: addMessageEndpoint,
      messages: [{ role: "user", content: "hello" }],
    });
    const expected = stripIndents`USER:
    hello

    ASSISTANT:`;
    expect(transcript).toContain(expected);
  });
  test("Should generate a transcript when multiple messages", async () => {
    const transcript = await generateTranscript({
      app,
      conversations,
      ipAddress,
      endpoint: addMessageEndpoint,
      messages: [
        { role: "user", content: "hello" },
        { role: "assistant", content: "hola" },
        { role: "user", content: "ola" },
      ],
    });
    const expected = stripIndents`USER:
    hello

    ASSISTANT:
    hola

    USER:
    ola

    ASSISTANT:`;
    expect(transcript).toContain(expected);
  });
  test("should throw if no messages", async () => {
    await expect(
      generateTranscript({
        app,
        conversations,
        ipAddress,
        endpoint: addMessageEndpoint,
        messages: [],
      })
    ).rejects.toThrow();
  });
});
