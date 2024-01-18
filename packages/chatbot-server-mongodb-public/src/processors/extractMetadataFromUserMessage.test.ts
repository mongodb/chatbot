import { OpenAIClient } from "@azure/openai";
import { extractMetadataFromUserMessage } from "./extractMetadataFromUserMessage";
import { Message, ObjectId } from "mongodb-chatbot-server";

const args: Parameters<typeof extractMetadataFromUserMessage>[0] = {
  openAiClient: new OpenAIClient("TODO"),
  deploymentName: "TODO",
  userMessageText: "TODO",
  numPrecedingMessagesToInclude: 2,
};
describe("extractMetadataFromUserMessage - unit tests", () => {
  it("should return metadata object with required properties", async () => {
    const result = await extractMetadataFromUserMessage(args);
    expect(result.rejectQuery).toBeDefined();
  });

  it("should return an empty array when there are only system messages", () => {
    const messages = [
      {
        role: "system",
        content: "Hello",
        id: new ObjectId(),
        createdAt: new Date(),
      },
      {
        role: "system",
        content: "How are you?",
        id: new ObjectId(),
        createdAt: new Date(),
      },
    ] satisfies Message[];
    const result = extractMetadataFromUserMessage({ ...args, messages });
    expect(result).toEqual([]);
  });

  it("should return the n latest non-system messages when there are more than n non-system messages", () => {
    const messages = [
      { role: "system", content: "Hello" },
      { role: "user", content: "Hi" },
      { role: "user", content: "How are you?" },
      { role: "user", content: "Goodbye" },
    ];
    const numPrecedingMessagesToInclude = 2;
    const result = extractMetadataFromUserMessage(
      messages,
      numPrecedingMessagesToInclude
    );
    expect(result).toEqual([
      { role: "user", content: "How are you?" },
      { role: "user", content: "Goodbye" },
    ]);
  });
});

describe("extractMetadataFromUserMessage - qualitative tests", () => {
  // TODO:: add qualitative tests
});
