import { formatUserMessageForGeneration } from "./formatUserMessageForGeneration";
import { ConversationCustomData, logger } from "mongodb-rag-core";
import { ORIGIN_RULES } from "mongodb-chatbot-server";

beforeAll(() => {
  logger.error = jest.fn();
});

describe("formatUserMessageForGeneration", () => {
  const userMessageText = "Hello, world!";
  const reqId = "test-request-id";
  const testMongoDbPageUrl = "https://mongodb.com";
  const resultMongoDbPageUrl = "mongodb.com";

  it("formats front matter correctly for mongodb.com origin", () => {
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        origin: testMongoDbPageUrl,
      } satisfies ConversationCustomData,
    });
    expect(result).toEqual(`---
pageUrl: ${resultMongoDbPageUrl}
---

${userMessageText}`);
  });

  it("adds pageUrl front matter for subdomain of mongodb.com", () => {
    const origin = "https://learn.mongodb.com";
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: { origin } satisfies ConversationCustomData,
    });
    expect(result).toEqual(`---
pageUrl: learn.mongodb.com
---

${userMessageText}`);
  });

  it("normalizes a URL with trailing backslash", () => {
    const origin = testMongoDbPageUrl + "/docs/pageName/";
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        origin,
      } satisfies ConversationCustomData,
    });
    expect(result).toEqual(`---
pageUrl: ${resultMongoDbPageUrl + "/docs/pageName"}
---

${userMessageText}`);
  });

  it("normalizes a URL with query", () => {
    const origin =
      "https://learn.mongodb.com/courses/mongodb-for-sql-experts?param1=value1&param2=value2";
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        origin,
      } satisfies ConversationCustomData,
    });
    expect(result).toEqual(`---
pageUrl: learn.mongodb.com/courses/mongodb-for-sql-experts
---

${userMessageText}`);
  });

  it("logs a warning & returns the original message if customData is empty", () => {
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {} satisfies ConversationCustomData,
    });
    expect(result).toEqual(userMessageText);
    expect(logger.error).toHaveBeenCalled();
  });

  it("does not add pageUrl for non-mongodb.com origins", () => {
    const origin = "https://example.com";
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: { origin } satisfies ConversationCustomData,
    });
    expect(result).toEqual(userMessageText);
  });

  it("adds client front matter for VSCODE originCode", () => {
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        origin: "vscode-mongodb-copilot",
        originCode: "VSCODE",
      } satisfies ConversationCustomData,
    });
    expect(result).toEqual(`---
client: MongoDB VS Code extension
---

${userMessageText}`);
  });

  it("adds client front matter for GEMINI_CODE_ASSIST originCode", () => {
    const origin = "google-gemini-code-assist";
    const originCode = "GEMINI_CODE_ASSIST";
    const expectedClientLabel = "Gemini Code Assist";
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        origin,
        originCode,
      } satisfies ConversationCustomData,
    });
    expect(result).toEqual(`---
client: ${expectedClientLabel}
---

${userMessageText}`);
  });

  it("does not add client front matter for unlabelled mongodb originCodes", () => {
    const unlabelledOriginCodes: string[] = [];
    ORIGIN_RULES.reduce((acc, rule) => {
      if (!rule.label) unlabelledOriginCodes.push(rule.code);
      return acc;
    }, unlabelledOriginCodes);

    unlabelledOriginCodes.forEach((originCode) => {
      const result = formatUserMessageForGeneration({
        userMessageText,
        reqId,
        customData: {
          originCode,
        } satisfies ConversationCustomData,
      });
      expect(result).toEqual(userMessageText);
    });
  });

  it("logs a warning and does not add pageUrl if origin is malformed", () => {
    const malformedOrigin = "http://not a url";
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        origin: malformedOrigin,
      } satisfies ConversationCustomData,
    });
    expect(logger.error).toHaveBeenCalled();
    expect(result).toEqual(userMessageText);
  });

  it("logs a warning and returns user message for an unknown originCode", () => {
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        origin: "https://example.com",
        originCode: "NOT_A_CODE",
      } satisfies ConversationCustomData,
    });
    expect(logger.error).toHaveBeenCalled();
    expect(result).toEqual(userMessageText);
  });

  it("adds both pageUrl and client front matter if both are present", () => {
    const originCode = "VSCODE";
    const expectedClientLabel = "MongoDB VS Code extension";
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        origin: testMongoDbPageUrl,
        originCode,
      } satisfies ConversationCustomData,
    });
    expect(result).toEqual(`---
pageUrl: ${resultMongoDbPageUrl}
client: ${expectedClientLabel}
---

${userMessageText}`);
  });

  it("returns original user message when given unknown origin", () => {
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        origin: "https://example.com",
        originCode: "OTHER",
      } satisfies ConversationCustomData,
    });
    expect(result).toEqual(userMessageText);
  });

  it("returns original user message when given unused fields", () => {
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        ip: "foo",
        userAgent: "bar",
      } satisfies ConversationCustomData,
    });
    expect(result).toEqual(userMessageText);
  });
});
