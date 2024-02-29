import { ObjectId } from "mongodb-chatbot-server";
import { makeGenerateConversationData } from "./generateConversationData";
import { makeMockConversations } from "../test/mockConversations";
import { makeMockExpressApp } from "../test/mockExpressApp";
import { testCases, triggerErrorTestCases } from "../test/mockTestCases";

const mockConversations = makeMockConversations();

const mockExpressApp = makeMockExpressApp(mockConversations);

describe("makeGenerateConversationData", () => {
  const generateConversationData = makeGenerateConversationData({
    conversations: mockConversations,
  });
  const server = mockExpressApp.listen(3000);
  afterAll(() => {
    server.close();
  });
  it("should generate conversation data", async () => {
    const conversationData = await generateConversationData({
      runId: new ObjectId(),
      testCases,
    });
    expect(conversationData.failedCases.length).toBe(0);
    expect(conversationData.generatedData.length).toBeGreaterThan(0);
  });
  it("should handle skipped test cases", async () => {
    const conversationData = await generateConversationData({
      runId: new ObjectId(),
      testCases,
    });
    expect(conversationData.generatedData.length).toBeLessThan(
      testCases.length
    );
  });
  it("should handle failed test cases", async () => {
    const conversationData = await generateConversationData({
      runId: new ObjectId(),
      testCases: triggerErrorTestCases,
    });
    expect(conversationData.failedCases.length).toBeGreaterThan(0);
  });
  it("should sleep between conversations", async () => {
    const SLEEP_TIME = 500;
    const numSleeps = testCases.length - 1; // sleeps between each test case
    const generateConversationDataWithSleep = makeGenerateConversationData({
      conversations: mockConversations,
      sleepMs: SLEEP_TIME,
    });
    const start = Date.now();
    await generateConversationDataWithSleep({
      runId: new ObjectId(),
      testCases,
    });
    const end = Date.now();
    expect(end - start).toBeGreaterThan(SLEEP_TIME * numSleeps);
    // and confirm that it's not just taking a long time to run (which it shouldn't given the mocks)
    const start2 = Date.now();
    await generateConversationData({
      runId: new ObjectId(),
      testCases,
    });
    const end2 = Date.now();
    expect(end2 - start2).toBeLessThan(SLEEP_TIME * numSleeps);
  });
});
