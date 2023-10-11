import { MongoDB } from "chat-core";
import { Express } from "express";
import { makeTestApp } from "../testHelpers";
import { ConversationsService } from "../services/conversations";
import { AppConfig, CONVERSATIONS_API_V1_PREFIX } from "../app";
import { generateTranscript } from "./generateChatTranscript";
import { getTestCasesFromYaml } from "./getTestCasesFromYaml";
import "../../global.d";
import { TestCase } from "./TestCase";

const testCases = getTestCasesFromYaml("testCases.yaml") as TestCase[];

let mongodb: MongoDB;
let app: Express;
let appConfig: AppConfig;
let conversations: ConversationsService;
let ipAddress: string;
const addMessageEndpoint =
  CONVERSATIONS_API_V1_PREFIX + "/:conversationId/messages?stream=false";

jest.setTimeout(30000);
beforeAll(async () => {
  ({ mongodb, app, appConfig, ipAddress } = await makeTestApp());
  conversations = appConfig.conversationsRouterConfig.conversations;
});
afterAll(async () => {
  await mongodb?.db.dropDatabase();
  await mongodb?.close();
});

describe("Edge Cases Qualitative Tests", () => {
  const edgeCaseTestCases = testCases.filter((testCase) =>
    testCase.tags?.includes("edge_case")
  );
  test.each(edgeCaseTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: any) => {
      console.log(testCase.name);
      const transcript = await generateTranscript({
        messages: testCase.messages,
        conversations,
        app,
        ipAddress,
        endpoint: addMessageEndpoint,
      });
      await expect(transcript).toMeetChatQualityStandard(testCase.expectation);
    }
  );
});
describe("Security Qualitative Tests", () => {
  const securityTestCases = testCases.filter((testCase) =>
    testCase.tags?.includes("security")
  );
  test.each(securityTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: any) => {
      const transcript = await generateTranscript({
        messages: testCase.messages,
        conversations,
        app,
        ipAddress,
        endpoint: addMessageEndpoint,
      });
      await expect(transcript).toMeetChatQualityStandard(testCase.expectation);
    }
  );
});

describe("Atlas Qualitative Tests", () => {
  const atlasTestCases = testCases.filter((testCase) =>
    testCase.tags?.includes("atlas")
  );
  test.each(atlasTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: any) => {
      const transcript = await generateTranscript({
        messages: testCase.messages,
        conversations,
        app,
        ipAddress,
        endpoint: addMessageEndpoint,
      });
      await expect(transcript).toMeetChatQualityStandard(testCase.expectation);
    }
  );
});
describe("Drivers Qualitative Tests", () => {
  const driversTestCases = testCases.filter((testCase) =>
    testCase.tags?.includes("drivers")
  );
  test.each(driversTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: any) => {
      const transcript = await generateTranscript({
        messages: testCase.messages,
        conversations,
        app,
        ipAddress,
        endpoint: addMessageEndpoint,
      });
      await expect(transcript).toMeetChatQualityStandard(testCase.expectation);
    }
  );
});

describe("Server Qualitative Tests", () => {
  const driversTestCases = testCases.filter((testCase) =>
    testCase.tags?.includes("server")
  );
  test.each(driversTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: any) => {
      const transcript = await generateTranscript({
        messages: testCase.messages,
        conversations,
        app,
        ipAddress,
        endpoint: addMessageEndpoint,
      });
      await expect(transcript).toMeetChatQualityStandard(testCase.expectation);
    }
  );
});
describe("Chatbot Meta Qualitative Tests", () => {
  const driversTestCases = testCases.filter((testCase) =>
    testCase.tags?.includes("chatbot_meta")
  );
  test.each(driversTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: any) => {
      const transcript = await generateTranscript({
        messages: testCase.messages,
        conversations,
        app,
        ipAddress,
        endpoint: addMessageEndpoint,
      });
      await expect(transcript).toMeetChatQualityStandard(testCase.expectation);
    }
  );
});
