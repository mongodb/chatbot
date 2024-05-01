import {
  Conversation,
  ConversationsService,
  Message,
  MessageBase,
} from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core";

const createMockConvo = (initialMessages: MessageBase[]) =>
  ({
    _id: new ObjectId(),
    messages: initialMessages.map(
      (msg) =>
        ({
          ...msg,
          id: new ObjectId(),
          createdAt: new Date(),
        } as Message)
    ),

    createdAt: new Date(),
  } satisfies Conversation);

export const makeMockConversations: () => ConversationsService = () => {
  const conversationDb: Record<string, Conversation> = {};
  return {
    async create(params) {
      const initialMessages = params?.initialMessages ?? [];
      const conversation = createMockConvo(initialMessages);
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
