import { stripIndents } from "common-tags";
import { meetsChatQualityStandards } from "./meetsChatQualityStandardsJestExtension";
import "./meetsChatQualityStandardsJestExtension";

describe("meetsChatQualityStandards()", () => {
  test("should return true when the response meets chat quality standards", async () => {
    const conversation = stripIndents`USER: I am a golden retriever named Jasper.
    ASSISTANT: Hi Jasper! What can I help you with today?
    USER: What's my name?
    ASSISTANT: Your name is Jasper.`;
    const expectation =
      "The assistant should correctly respond with the user's name.";
    const result = await meetsChatQualityStandards(conversation, expectation);
    const expectedResponseMessage = stripIndents`Message met quality standards.

    Received:
    ${conversation}

    Expected output: ${expectation}`;
    expect(result.pass).toBe(true);
    expect(result.message()).toContain(expectedResponseMessage);
  });
  test("should return false with reason when the response does not meet chat quality standards", async () => {
    const conversation = stripIndents`USER: I am a golden retriever named Jasper.
    ASSISTANT: Hi Jasper! What can I help you with today?
    USER: What's my name?
    ASSISTANT: Your name is Chippy.`;
    const expectation =
      "The assistant should correctly respond with the user's name.";
    const result = await meetsChatQualityStandards(conversation, expectation);
    const expectedResponseMessage = stripIndents`Message did not meet quality standards.

    Received:
    ${conversation}

    Expected output: ${expectation}

    Reason: `;
    expect(result.pass).toBe(false);
    expect(result.message()).toContain(expectedResponseMessage);
  });
});
describe("meetsChatQualityStandards() used as jest extension", () => {
  test("should return true when the response meets chat quality standards", async () => {
    const conversation = stripIndents`USER: I am a golden retriever named Jasper.
    ASSISTANT: Hi Jasper! What can I help you with today?
    USER: What's my name?
    ASSISTANT: Your name is Jasper.`;
    const expectation =
      "The assistant should correctly respond with the user's name.";
    await expect(conversation).toMeetChatQualityStandard(expectation);
  });
});
