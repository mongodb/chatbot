import { MongoDB } from "chat-core";
import { Express } from "express";
import { makeConversationsRoutesDefaults } from "../testHelpers";
import { ConversationsService } from "../services/conversations";
import { CONVERSATIONS_API_V1_PREFIX } from "../app";
import { TestCase, generateTranscript } from "./generateChatTranscript";
import yaml from "yaml";
import { readFileSync } from "fs";
import path from "path";
import "../../global.d";

const yamlFile = readFileSync(path.join(__dirname, "security.yaml"), "utf8");
const testCases = yaml.parse(yamlFile) as TestCase[];

let mongodb: MongoDB;
let app: Express;
let conversations: ConversationsService;
let ipAddress: string;
const addMessageEndpoint =
  CONVERSATIONS_API_V1_PREFIX + "/:conversationId/messages?streaming=false";

jest.setTimeout(10000);
beforeAll(async () => {
  ({ mongodb, app, conversations, ipAddress } =
    await makeConversationsRoutesDefaults());
});
afterAll(async () => {
  await mongodb?.db.dropDatabase();
  await mongodb?.close();
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
