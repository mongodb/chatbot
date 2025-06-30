import exp from "constants";
import { formatUserMessageForGeneration } from "./formatUserMessageForGeneration";
import { ConversationCustomData, logger } from "mongodb-rag-core";

beforeAll(() => {
  logger.warn = jest.fn();
});

describe("formatUserMessageForGeneration", () => {
  const userMessage = "Hello, world!";

  it("formats front matter correctly for mongodb.com origin", () => {
    const origin = "https://mongodb.com";
    const result = formatUserMessageForGeneration(userMessage, {
      origin,
    } as ConversationCustomData);
    expect(result).toEqual(`---
pageUrl: ${origin}
---

${userMessage}`);
  });

  it("adds pageUrl front matter for subdomain of mongodb.com", () => {
    const origin = "https://learn.mongodb.com";
    const result = formatUserMessageForGeneration(userMessage, {
      origin,
    } as ConversationCustomData);
    expect(result).toEqual(`---
pageUrl: ${origin}
---

${userMessage}`);
  });

  it("logs a warning & returns the original message if customData is empty", () => {
    const result = formatUserMessageForGeneration(
      userMessage,
      {} as ConversationCustomData
    );
    expect(result).toEqual(userMessage);
    expect(logger.warn).toHaveBeenCalled();
  });

  it("does not add pageUrl for non-mongodb.com origins", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "https://example.com",
    } as ConversationCustomData);
    expect(result).toEqual(userMessage);
  });

  it("adds client front matter for VSCODE originCode", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "vscode-mongodb-copilot",
      originCode: "VSCODE",
    } as ConversationCustomData);
    expect(result).toEqual(`---
client: MongoDB VS Code plugin
---

${userMessage}`);
  });

  it("adds client front matter for GEMINI_CODE_ASSIST originCode", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "google-gemini-code-assist",
      originCode: "GEMINI_CODE_ASSIST",
    } as ConversationCustomData);
    expect(result).toEqual(`---
client: Gemini Code Assist
---

${userMessage}`);
  });

  it("logs a warning and does not add pageUrl if origin is malformed", () => {
    const malformedOrigin = "http://not a url";
    const result = formatUserMessageForGeneration(userMessage, {
      origin: malformedOrigin,
    } as ConversationCustomData);
    expect(logger.warn).toHaveBeenCalled();
    expect(result).toEqual(userMessage);
  });

  it("logs a warning and returns user message for an unknown originCode", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "https://example.com",
      originCode: "NOT_A_CODE",
    } as ConversationCustomData);
    expect(logger.warn).toHaveBeenCalled();
    expect(result).toEqual(userMessage);
  });

  it("adds both pageUrl and client front matter if both are present", () => {
    const origin = "https://mongodb.com";
    const originCode = "VSCODE";
    const result = formatUserMessageForGeneration(userMessage, {
      origin,
      originCode,
    } as ConversationCustomData);
    expect(result).toEqual(`---
pageUrl: ${origin}
client: MongoDB VS Code plugin
---

${userMessage}`);
  });

  it("returns original user message when given unknown origin", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "https://example.com",
      originCode: "OTHER",
    } as ConversationCustomData);
    expect(result).toEqual(userMessage);
  });

  it("returns original user message when given unused fields", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      ip: "foo",
      userAgent: "bar",
    } as ConversationCustomData);
    expect(result).toEqual(userMessage);
  });
});
