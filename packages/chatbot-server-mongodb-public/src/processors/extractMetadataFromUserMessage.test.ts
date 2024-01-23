import { OpenAIClient } from "@azure/openai";
import { extractMetadataFromUserMessage } from "./extractMetadataFromUserMessage";
import { Message, ObjectId } from "mongodb-chatbot-server";

const args: Parameters<typeof extractMetadataFromUserMessage>[0] = {
  openAiClient: new OpenAIClient("TODO"),
  deploymentName: "TODO",
  userMessageText: "TODO",
};
describe("extractMetadataFromUserMessage - unit tests", () => {
  // TODO: add unit tests
});

describe("extractMetadataFromUserMessage - qualitative tests", () => {
  // TODO:: add qualitative tests
});
