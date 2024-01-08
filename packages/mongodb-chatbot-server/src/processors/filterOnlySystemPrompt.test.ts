import { ObjectId } from "mongodb-rag-core";
import { Conversation, Message } from "../services";
import { filterOnlySystemPrompt } from "./filterOnlySystemPrompt";

const mockConversationBase: Conversation = {
  _id: new ObjectId(),
  messages: [],
  createdAt: new Date(),
};
const systemMessage = {
  role: "system",
  content: "Hello",
  id: new ObjectId(),
  createdAt: new Date(),
} satisfies Message;
const userMessage = {
  role: "user",
  content: "Hi",
  id: new ObjectId(),
  createdAt: new Date(),
} satisfies Message;

describe("filterOnlySystemPrompt", () => {
  it("should return an empty array when there are no messages", () => {
    const conversation = mockConversationBase;
    const result = filterOnlySystemPrompt(conversation);
    expect(result).toEqual([]);
  });

  it("should return an array with the system message when there is one", () => {
    const conversation = {
      ...mockConversationBase,
      messages: [systemMessage, userMessage],
    };
    const result = filterOnlySystemPrompt(conversation);
    expect(result).toEqual([systemMessage]);
  });

  it("should return an empty array when there is no system message", () => {
    const conversation = { ...mockConversationBase, messages: [userMessage] };
    const result = filterOnlySystemPrompt(conversation);
    expect(result).toEqual([]);
  });

  it("should only return first system message", () => {
    const conversation = {
      ...mockConversationBase,
      messages: [systemMessage, systemMessage, userMessage],
    };
    const result = filterOnlySystemPrompt(conversation);
    expect(result).toEqual([systemMessage]);
  });
});
