import { formatUserMessageForGeneration } from "./formatUserMessageForGeneration";
import { ConversationCustomData, logger } from "mongodb-rag-core";

beforeAll(() => {
  logger.error = jest.fn();
});

describe("formatUserMessageForGeneration", () => {
  const userMessageText = "Hello, world!";
  const reqId = "test-request-id";

  it("formats front matter correctly for mongodb.com origin", () => {
    const origin = "https://mongodb.com";
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: { origin } satisfies ConversationCustomData,
    });
    expect(result).toEqual(`---
pageUrl: ${origin}
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
pageUrl: ${origin}
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
client: MongoDB VS Code plugin
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
    const origin = "https://mongodb.com";
    const originCode = "VSCODE";
    const expectedClientLabel = "MongoDB VS Code plugin";
    const result = formatUserMessageForGeneration({
      userMessageText,
      reqId,
      customData: {
        origin,
        originCode,
      } satisfies ConversationCustomData,
    });
    expect(result).toEqual(`---
pageUrl: ${origin}
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
