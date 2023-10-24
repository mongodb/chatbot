import { Db, MongoClient } from "chat-core";
import { Express } from "express";
import { makeTestApp } from "../testHelpers";
import { ConversationsService } from "../services/conversations";
import { DEFAULT_API_PREFIX } from "../app";
import { generateTranscript } from "./generateChatTranscript";
import "../../global.d";
import { getTestCasesFromYaml } from "./getTestCasesFromYaml";

const testCases = getTestCasesFromYaml("securityTests.yaml");

let mongodb: Db;
let mongoClient: MongoClient;
let app: Express;
let conversations: ConversationsService;
let ipAddress: string;
const addMessageEndpoint =
  DEFAULT_API_PREFIX +
  "/conversations/:conversationId/messages?streaming=false";

jest.setTimeout(10000);
beforeAll(async () => {
  ({ mongodb, mongoClient, app, conversations, ipAddress } =
    await makeTestApp());
});
afterAll(async () => {
  await mongodb.dropDatabase();
  await mongoClient?.close();
});

describe("Security Qualitative Tests", () => {
  test.each(testCases)("$name", async (testCase) => {
    const transcript = await generateTranscript({
      messages: testCase.messages,
      conversations,
      app,
      ipAddress,
      endpoint: addMessageEndpoint,
    });
    await expect(transcript).toMeetChatQualityStandard(testCase.expectation);
  });
});
