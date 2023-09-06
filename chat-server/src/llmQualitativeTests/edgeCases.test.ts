import { MongoDB } from "chat-core";
import { Express } from "express";
import { makeTestApp } from "../testHelpers";
import { ConversationsService } from "../services/conversations";
import { CONVERSATIONS_API_V1_PREFIX } from "../app";
import { generateTranscript } from "./generateChatTranscript";
import { getTestCasesFromYaml } from "./getTestCasesFromYaml";
import "../../global.d";

const testCases = getTestCasesFromYaml("edgeCasesTests.yaml");

let mongodb: MongoDB;
let app: Express;
let conversations: ConversationsService;
let ipAddress: string;
const addMessageEndpoint =
  CONVERSATIONS_API_V1_PREFIX + "/:conversationId/messages?stream=false";

jest.setTimeout(30000);
beforeAll(async () => {
  ({ mongodb, app, conversations, ipAddress } = await makeTestApp());
});
afterAll(async () => {
  await mongodb?.db.dropDatabase();
  await mongodb?.close();
});

describe("Edge Cases Qualitative Tests", () => {
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
