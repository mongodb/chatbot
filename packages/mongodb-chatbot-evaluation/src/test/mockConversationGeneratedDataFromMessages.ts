import { Message } from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core";
import { ConversationGeneratedData } from "../generate";

export function mockConversationGeneratedDataFromMessages(
  messages: Message[]
): ConversationGeneratedData {
  return {
    type: "conversation",
    data: {
      _id: new ObjectId(),
      createdAt: new Date(),
      messages,
    },
    evalData: {
      name: "sky color test case 1",
      qualitativeFinalAssistantMessageExpectation: "not relevant for this eval",
    },
    _id: new ObjectId(),
    commandRunId: new ObjectId(),
  };
}
