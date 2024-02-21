import {
  Conversation,
  ConversationsService,
  Message,
} from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core";

const createMockConvo = () =>
  ({
    _id: new ObjectId(),
    messages: [
      {
        content: "Hello",
        role: "user",
        createdAt: new Date(),
        id: new ObjectId(),
      },
    ],
    createdAt: new Date(),
  } satisfies Conversation);

export const makeMockConversations = () => {
  const conversationDb: Record<string, Conversation> = {};
  return {
    async create() {
      const conversation = createMockConvo();
      conversationDb[conversation._id.toHexString()] = conversation;
      return conversation;
    },
    async findById({ _id }) {
      const conversation = conversationDb[_id.toHexString()];
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      return conversation;
    },
    addConversationMessage: jest.fn(async ({ conversationId, message }) => {
      const conversation = conversationDb[conversationId.toHexString()];
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      const msgForDb = {
        ...message,
        id: new ObjectId(),
        createdAt: new Date(),
      } satisfies Message;
      conversation.messages.push(msgForDb);
      return msgForDb;
    }),
    commentMessage: jest.fn(),
    rateMessage: jest.fn(),
    addManyConversationMessages: jest.fn(),
    conversationConstants: {
      LLM_NOT_WORKING: "LLM_NOT_WORKING",
      NO_RELEVANT_CONTENT: "NO_RELEVANT_CONTENT",
    },
  } satisfies ConversationsService;
};
