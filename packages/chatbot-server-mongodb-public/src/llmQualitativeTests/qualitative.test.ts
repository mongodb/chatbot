import { Express } from "express";
import { makeTestApp } from "../test/testHelpers";
import {
  AppConfig,
  ConversationsService,
  Db,
  MongoClient,
} from "mongodb-chatbot-server";
import { generateTranscript } from "./generateChatTranscript";
import { getTestCasesFromYaml } from "./getTestCasesFromYaml";
import "../../global.d.ts";
import { TestCase } from "./TestCase";

const testCases = getTestCasesFromYaml("testCases.yaml").filter(
  (testCase) => !testCase.skip
);

let mongoClient: MongoClient;
let db: Db;
let app: Express;
let conversations: ConversationsService;
let ipAddress: string;
const addMessageEndpoint =
  "/api/v1/conversations/:conversationId/messages?stream=false";

jest.setTimeout(30000);
beforeAll(async () => {
  ({ mongoClient, db, app, ipAddress, conversations } = await makeTestApp());
});
afterAll(async () => {
  await db.dropDatabase();
  await mongoClient?.close();
});

describe("Edge Cases Qualitative Tests", () => {
  const edgeCaseTestCases = testCases.filter((testCase) =>
    testCase.tags?.includes("edge_case")
  );
  test.each(edgeCaseTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: TestCase) => {
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
    async (testCase: TestCase) => {
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
    async (testCase: TestCase) => {
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
    testCase.tags?.includes("driver")
  );
  test.each(driversTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: TestCase) => {
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
describe("Compass Qualitative Tests", () => {
  const driversTestCases = testCases.filter((testCase) =>
    testCase.tags?.includes("compass")
  );
  test.each(driversTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: TestCase) => {
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
    testCase.tags?.includes("meta")
  );
  test.each(driversTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: TestCase) => {
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

describe("MongoDB Company Qualitative Tests", () => {
  const driversTestCases = testCases.filter((testCase) =>
    testCase.tags?.includes("company")
  );
  test.each(driversTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: TestCase) => {
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

// This only runs the top search queries when the env var RUN_TOP is set.
// We do not want to run these tests every time because they overlap other tests.
// (i.e a top search query is also a atlas, server, etc. question)
const _runTop = process.env.RUN_TOP ? describe.only : describe.skip;
_runTop("Top Search Results Qualitative Tests", () => {
  const driversTestCases = testCases.filter((testCase) =>
    testCase.tags?.includes("top_query")
  );
  test.each(driversTestCases.map((testCase) => testCase))(
    "$name",
    async (testCase: TestCase) => {
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
