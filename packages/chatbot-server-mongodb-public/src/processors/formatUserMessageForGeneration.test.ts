import { formatUserMessageForGeneration } from "./formatUserMessageForGeneration";
import { ConversationCustomData, logger } from "mongodb-rag-core";

beforeAll(() => {
  logger.error = jest.fn();
});

describe("formatUserMessageForGeneration", () => {
  const userMessage = "Hello, world!";
  const reqId = "test-request-id";

  it("formats front matter correctly for mongodb.com origin", () => {
    const origin = "https://mongodb.com";
    const result = formatUserMessageForGeneration(userMessage, reqId, {
      origin,
    } satisfies ConversationCustomData);
    expect(result).toEqual(`---
pageUrl: ${origin}
---

${userMessage}`);
  });

  it("adds pageUrl front matter for subdomain of mongodb.com", () => {
    const origin = "https://learn.mongodb.com";
    const result = formatUserMessageForGeneration(userMessage, reqId, {
      origin,
    } satisfies ConversationCustomData);
    expect(result).toEqual(`---
pageUrl: ${origin}
---

${userMessage}`);
  });

  it("logs a warning & returns the original message if customData is empty", () => {
    const result = formatUserMessageForGeneration(
      userMessage,
      reqId,
      {} satisfies ConversationCustomData
    );
    expect(result).toEqual(userMessage);
    expect(logger.error).toHaveBeenCalled();
  });

  it("does not add pageUrl for non-mongodb.com origins", () => {
    const result = formatUserMessageForGeneration(userMessage, reqId, {
      origin: "https://example.com",
    } satisfies ConversationCustomData);
    expect(result).toEqual(userMessage);
  });

  it("adds client front matter for VSCODE originCode", () => {
    const result = formatUserMessageForGeneration(userMessage, reqId, {
      origin: "vscode-mongodb-copilot",
      originCode: "VSCODE",
    } satisfies ConversationCustomData);
    expect(result).toEqual(`---
client: MongoDB VS Code plugin
---

${userMessage}`);
  });

  it("adds client front matter for GEMINI_CODE_ASSIST originCode", () => {
    const origin = "google-gemini-code-assist";
    const originCode = "GEMINI_CODE_ASSIST";
    const expectedClientLabel = "Gemini Code Assist";
    const result = formatUserMessageForGeneration(userMessage, reqId, {
      origin,
      originCode,
    } satisfies ConversationCustomData);
    expect(result).toEqual(`---
client: ${expectedClientLabel}
---

${userMessage}`);
  });

  it("logs a warning and does not add pageUrl if origin is malformed", () => {
    const malformedOrigin = "http://not a url";
    const result = formatUserMessageForGeneration(userMessage, reqId, {
      origin: malformedOrigin,
    } satisfies ConversationCustomData);
    expect(logger.error).toHaveBeenCalled();
    expect(result).toEqual(userMessage);
  });

  it("logs a warning and returns user message for an unknown originCode", () => {
    const result = formatUserMessageForGeneration(userMessage, reqId, {
      origin: "https://example.com",
      originCode: "NOT_A_CODE",
    } satisfies ConversationCustomData);
    expect(logger.error).toHaveBeenCalled();
    expect(result).toEqual(userMessage);
  });

  it("adds both pageUrl and client front matter if both are present", () => {
    const origin = "https://mongodb.com";
    const originCode = "VSCODE";
    const expectedClientLabel = "MongoDB VS Code plugin";
    const result = formatUserMessageForGeneration(userMessage, reqId, {
      origin,
      originCode,
    } satisfies ConversationCustomData);
    expect(result).toEqual(`---
pageUrl: ${origin}
client: ${expectedClientLabel}
---

${userMessage}`);
  });

  it("returns original user message when given unknown origin", () => {
    const result = formatUserMessageForGeneration(userMessage, reqId, {
      origin: "https://example.com",
      originCode: "OTHER",
    } satisfies ConversationCustomData);
    expect(result).toEqual(userMessage);
  });

  it("returns original user message when given unused fields", () => {
    const result = formatUserMessageForGeneration(userMessage, reqId, {
      ip: "foo",
      userAgent: "bar",
    } satisfies ConversationCustomData);
    expect(result).toEqual(userMessage);
  });
});
