import { Conversation, Message } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { makeFilterNPreviousMessages } from "./makeFilterNPreviousMessages";

const mockConversationBase: Conversation = {
  _id: new ObjectId(),
  messages: [],
  createdAt: new Date(),
};
const userMessage = {
  role: "user",
  content: "Hi",
  id: new ObjectId(),
  createdAt: new Date(),
} satisfies Message;

describe("makeFilterNPreviousMessages", () => {
  it("should return the n latest messages when there are more than n messages", async () => {
    const filterNPreviousMessages = makeFilterNPreviousMessages(2);
    const userMessage2 = {
      role: "user",
      content: "Hello",
      id: new ObjectId(),
      createdAt: new Date(),
    } satisfies Message;
    const userMessage3 = {
      role: "user",
      content: "How are you",
      id: new ObjectId(),
      createdAt: new Date(),
    } satisfies Message;

    const conversation = {
      ...mockConversationBase,
      messages: [userMessage, userMessage2, userMessage3],
    };
    const result = await filterNPreviousMessages(conversation);
    expect(result).toEqual([userMessage2, userMessage3]);
  });
});
