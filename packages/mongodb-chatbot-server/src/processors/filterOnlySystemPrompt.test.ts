import { Conversation, Message } from "mongodb-rag-core";
import { filterOnlySystemPrompt } from "./filterOnlySystemPrompt";
import { ObjectId } from "mongodb-rag-core/mongodb";

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
  it("should return an empty array when there are no messages", async () => {
    const conversation = mockConversationBase;
    const result = await filterOnlySystemPrompt(conversation);
    expect(result).toEqual([]);
  });

  it("should return an array with the system message when there is one", async () => {
    const conversation = {
      ...mockConversationBase,
      messages: [systemMessage, userMessage],
    };
    const result = await filterOnlySystemPrompt(conversation);
    expect(result).toEqual([systemMessage]);
  });

  it("should return an empty array when there is no system message", async () => {
    const conversation = { ...mockConversationBase, messages: [userMessage] };
    const result = await filterOnlySystemPrompt(conversation);
    expect(result).toEqual([]);
  });

  it("should only return first system message", async () => {
    const conversation = {
      ...mockConversationBase,
      messages: [systemMessage, systemMessage, userMessage],
    };
    const result = await filterOnlySystemPrompt(conversation);
    expect(result).toEqual([systemMessage]);
  });
});
