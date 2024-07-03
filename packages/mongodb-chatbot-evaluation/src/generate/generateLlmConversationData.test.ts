import { FakeListChatModel } from "@langchain/core/utils/testing";
import { makeGenerateLlmConversationData } from "./generateLlmConversationData";
import { ObjectId } from "mongodb-rag-core";
import { testCases, triggerErrorTestCases } from "../test/mockTestCases";
import { ChatOpenAI } from "@langchain/openai";
import { makeLangchainChatLlm } from "mongodb-chatbot-server";

describe("makeGenerateLlmConversationData", () => {
  const mockChatLlm = makeLangchainChatLlm({
    chatModel: new FakeListChatModel({
      responses: ["Stop mocking me!"],
    }),
  });
  const generateLlmConversationData = makeGenerateLlmConversationData({
    chatLlm: mockChatLlm,
  });

  it("should generate conversation data", async () => {
    const conversationData = await generateLlmConversationData({
      runId: new ObjectId(),
      testCases,
    });
    expect(conversationData.failedCases.length).toBe(0);
    expect(conversationData.generatedData.length).toBeGreaterThan(0);
  });
  it("should handle skipped test cases", async () => {
    const conversationData = await generateLlmConversationData({
      runId: new ObjectId(),
      testCases,
    });
    expect(conversationData.generatedData.length).toBeLessThan(
      testCases.length
    );
  });
  it("should handle failed test cases", async () => {
    const throwingLlm = new ChatOpenAI({
      openAIApiKey: "WILL THROW WHEN CALLED!",
    });
    const generateLlmConversationData = makeGenerateLlmConversationData({
      chatLlm: makeLangchainChatLlm({
        chatModel: throwingLlm,
      }),
      backOffOptions: {
        numOfAttempts: 1,
      },
    });
    const conversationData = await generateLlmConversationData({
      runId: new ObjectId(),
      testCases: triggerErrorTestCases,
    });
    expect(conversationData.failedCases.length).toBeGreaterThan(0);
  });
  it("should sleep between conversations", async () => {
    const SLEEP_TIME = 500;
    const numSleeps = testCases.length - 1; // sleeps between each test case
    const generateLlmConversationDataWithSleep =
      makeGenerateLlmConversationData({
        chatLlm: mockChatLlm,
        sleepMs: SLEEP_TIME,
        concurrency: 1,
      });
    const start = Date.now();
    await generateLlmConversationDataWithSleep({
      runId: new ObjectId(),
      testCases,
    });
    const end = Date.now();
    expect(end - start).toBeGreaterThan(SLEEP_TIME * numSleeps);
    // and confirm that it's not just taking a long time to run (which it shouldn't given the mocks)
    const start2 = Date.now();
    await generateLlmConversationData({
      runId: new ObjectId(),
      testCases,
    });
    const end2 = Date.now();
    expect(end2 - start2).toBeLessThan(SLEEP_TIME * numSleeps);
  });
});
