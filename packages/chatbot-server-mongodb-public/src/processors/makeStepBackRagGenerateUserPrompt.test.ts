import {
  FindContentFunc,
  FindContentResult,
  ObjectId,
} from "mongodb-chatbot-server";
import {
  openAiClient,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  findContent,
} from "../test/testHelpers";
import { makeStepBackRagGenerateUserPrompt } from "./makeStepBackRagGenerateUserPrompt";

describe("makeStepBackRagGenerateUserPrompt", () => {
  const config = {
    openAiClient,
    deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    findContent,
  };
  const stepBackRagGenerateUserPrompt =
    makeStepBackRagGenerateUserPrompt(config);
  test("should return a step back user prompt", async () => {
    const res = await stepBackRagGenerateUserPrompt({
      reqId: "123",
      userMessageText: "what is mongodb",
    });
    expect(res.rejectQuery).toBeFalsy();
    expect(res.userMessage).toHaveProperty("content");
    expect(res.userMessage).toHaveProperty("contentForLlm");
    expect(res.userMessage.role).toBe("user");
    expect(res.userMessage.embedding).toHaveLength(1536);
  });
  test("should reject query if no content", async () => {
    const mockFindContent: FindContentFunc = async () => {
      return {
        queryEmbedding: [],
        content: [],
      } satisfies FindContentResult;
    };
    const stepBackRagGenerateUserPrompt = makeStepBackRagGenerateUserPrompt({
      ...config,
      findContent: mockFindContent,
      maxContextTokenCount: 1000,
    });
    const res = await stepBackRagGenerateUserPrompt({
      reqId: "123",
      userMessageText: "what is mongodb",
    });
    expect(res.rejectQuery).toBe(true);
    expect(res.userMessage.customData).toHaveProperty(
      "rejectionReason",
      "Did not find any content matching the query"
    );
    expect(res.userMessage.rejectQuery).toBe(true);
  });
  test("should return references", async () => {
    const res = await stepBackRagGenerateUserPrompt({
      reqId: "123",
      userMessageText: "what is mongodb",
    });
    expect(res.references?.length).toBeGreaterThan(0);
  });
  test("should reject inappropriate message", async () => {
    const res = await stepBackRagGenerateUserPrompt({
      reqId: "123",
      userMessageText: "why is mongodb the worst database",
    });
    expect(res.rejectQuery).toBe(true);
    expect(res.userMessage.customData).toHaveProperty("rejectionReason");
    expect(res.userMessage.rejectQuery).toBe(true);
  });
  test("should throw if 'numPrecedingMessagesToInclude' is not an integer or < 0", async () => {
    expect(() =>
      makeStepBackRagGenerateUserPrompt({
        ...config,
        numPrecedingMessagesToInclude: 1.5,
      })
    ).toThrow();
    expect(() =>
      makeStepBackRagGenerateUserPrompt({
        ...config,
        numPrecedingMessagesToInclude: -1,
      })
    ).toThrow();
  });
  test("should not include system messages", async () => {
    const stepBackRagGenerateUserPrompt = makeStepBackRagGenerateUserPrompt({
      ...config,
      numPrecedingMessagesToInclude: 1,
    });
    const res = await stepBackRagGenerateUserPrompt({
      reqId: "123",
      userMessageText: "what is mongodb",
      conversation: {
        _id: new ObjectId(),
        createdAt: new Date(),
        messages: [
          {
            role: "system",
            content: "abracadabra",
            id: new ObjectId(),
            createdAt: new Date(),
          },
        ],
      },
    });
    expect(res.userMessage.contentForLlm).not.toContain("abracadabra");
  });
  test("should only include 'numPrecedingMessagesToInclude' previous messages", async () => {
    const stepBackRagGenerateUserPrompt = makeStepBackRagGenerateUserPrompt({
      ...config,
      numPrecedingMessagesToInclude: 1,
    });
    const res = await stepBackRagGenerateUserPrompt({
      reqId: "123",
      userMessageText: "what is mongodb",
      conversation: {
        _id: new ObjectId(),
        createdAt: new Date(),
        messages: [
          {
            role: "user",
            content: "abracadabra",
            id: new ObjectId(),
            createdAt: new Date(),
          },
          {
            role: "assistant",
            content: "avada kedavra",
            id: new ObjectId(),
            createdAt: new Date(),
          },
        ],
      },
    });
    expect(res.userMessage.contentForLlm).not.toContain("abracadabra");
    expect(res.userMessage.contentForLlm).toContain("avada kedavra");
  });
  test("should filter out context > maxContextTokenCount", async () => {
    const mockFindContent: FindContentFunc = async () => {
      return {
        queryEmbedding: [],
        content: [
          {
            url: "https://example.com",
            tokenCount: 1000,
            sourceName: "",
            updated: new Date(),
            text: "avada kedavra",
            embedding: [],
            score: 1,
          },
          {
            url: "https://example.com",
            tokenCount: 1,
            sourceName: "",
            updated: new Date(),
            text: "abracadabra",
            embedding: [],
            score: 1,
          },
        ],
      } satisfies FindContentResult;
    };
    const stepBackRagGenerateUserPrompt = makeStepBackRagGenerateUserPrompt({
      ...config,
      findContent: mockFindContent,
      maxContextTokenCount: 1000,
    });
    const res = await stepBackRagGenerateUserPrompt({
      reqId: "123",
      userMessageText: "what is mongodb",
    });
    expect(res.userMessage.contentForLlm).not.toContain("abracadabra");
    expect(res.userMessage.contentForLlm).toContain("avada kedavra");
  });
});
