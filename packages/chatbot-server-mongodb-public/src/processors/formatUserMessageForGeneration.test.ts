import { formatUserMessageForGeneration } from "./formatUserMessageForGeneration";
import { logger } from "mongodb-rag-core";

beforeAll(() => {
  logger.warn = jest.fn();
});

describe("formatUserMessageForGeneration", () => {
  const userMessage = "Hello, world!";

  it("formats front matter correctly for mongodb.com origin", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "https://mongodb.com",
    });
    expect(result).toEqual(`---
pageUrl: https://mongodb.com
---
${userMessage}`);
  });

  it("adds pageUrl front matter for subdomain of mongodb.com", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "https://learn.mongodb.com",
    });
    expect(result).toContain("pageUrl: https://learn.mongodb.com");
  });

  it("returns the original message if customData is empty", () => {
    expect(
      formatUserMessageForGeneration(userMessage, { origin: undefined })
    ).toBe(userMessage);
    expect(formatUserMessageForGeneration(userMessage, {})).toBe(userMessage);
    expect(formatUserMessageForGeneration(userMessage)).toBe(userMessage);
  });

  it("does not add front matter if customData contains irrelevant keys", () => {
    expect(
      formatUserMessageForGeneration(userMessage, {
        someOtherKey: "str",
      })
    ).toBe(userMessage);
  });

  it("returns the original message if origin is not a string", () => {
    expect(formatUserMessageForGeneration(userMessage, { origin: 123 })).toBe(
      userMessage
    );
  });

  it("does not add pageUrl for non-mongodb.com origins", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "https://example.com",
    });
    expect(result).not.toContain("pageUrl:");
    expect(result).toBe(userMessage);
  });

  it("adds client front matter for VSCODE originCode", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "vscode-mongodb-copilot",
      originCode: "VSCODE",
    });
    expect(result).toContain("client: MongoDB VS Code plugin");
    expect(result).not.toContain("pageUrl:");
  });

  it("adds client front matter for GEMINI_CODE_ASSIST originCode", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "google-gemini-code-assist",
      originCode: "GEMINI_CODE_ASSIST",
    });
    expect(result).toContain("client: Gemini Code Assist");
    expect(result).not.toContain("pageUrl:");
  });

  it("does not add client front matter for unknown originCode", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "https://mongodb.com",
      originCode: "SOMETHING_ELSE",
    });
    expect(result).not.toContain("client:");
    expect(result).toContain("pageUrl: https://mongodb.com");
  });

  it("logs a warning and does not add pageUrl if origin is malformed", () => {
    const malformedOrigin = "http://not a url";
    const result = formatUserMessageForGeneration(userMessage, {
      origin: malformedOrigin,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      `Origin ${malformedOrigin} malformed. Not using in front matter.`
    );
    expect(result).toBe(userMessage);
  });

  it("adds both pageUrl and client front matter if both are present", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "https://mongodb.com",
      originCode: "VSCODE",
    });
    expect(result).toContain("pageUrl: https://mongodb.com");
    expect(result).toContain("client: MongoDB VS Code plugin");
    expect(result).toContain(userMessage);
  });

  it("returns the original message if frontMatters is empty", () => {
    const result = formatUserMessageForGeneration(userMessage, {
      origin: "https://example.com",
      originCode: "OTHER",
    });
    expect(result).toBe(userMessage);
  });
});
