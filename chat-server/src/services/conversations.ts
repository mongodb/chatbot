import { OpenAiChatMessage, OpenAiMessageRole, SystemPrompt } from "./ChatLlm";
import { ObjectId, Db } from "mongodb";
import { References } from "chat-core";

/**
  Message in the conversation as stored in the database.
 */
export interface Message {
  /**
    Unique identifier for the message.
  */
  id: ObjectId;

  /**
    The role of the message in the context of the conversation.
  */
  role: "system" | "assistant" | "user";

  /**
    Message that occurs in the conversation.
  */
  content: string;

  /**
    Only used when role is "user". The preprocessed content of the message that is sent to vector search.
  */
  preprocessedContent?: string;

  /**
    Set to `true` if the user liked the response, `false` if the user didn't like the response. No value if user didn't rate the response. Note that only messages with `role: "assistant"` can be rated.
  */
  rating?: boolean;

  /**
    The date the message was created.
  */
  createdAt: Date;

  /**
    Further reading links for the message.
  */
  references?: References;
}

/**
  Conversation between the user and the chatbot as stored in the database.
 */
export interface Conversation {
  _id: ObjectId;
  /** Messages in the conversation. */
  messages: Message[];
  /** The IP address of the user performing the conversation. */
  ipAddress: string;
  /** The date the conversation was created. */
  createdAt: Date;
}
export interface CreateConversationParams {
  ipAddress: string;
}
export interface AddConversationMessageParams {
  conversationId: ObjectId;
  content: string;
  preprocessedContent?: string;
  role: OpenAiMessageRole;
  references?: References;
}
export interface FindByIdParams {
  _id: ObjectId;
}
export interface RateMessageParams {
  conversationId: ObjectId;
  messageId: ObjectId;
  rating: boolean;
}
/**
  Service for managing conversations.
 */
export interface ConversationsService {
  create: ({ ipAddress }: CreateConversationParams) => Promise<Conversation>;
  addConversationMessage: ({
    conversationId,
    content,
    preprocessedContent,
    role,
    references,
  }: AddConversationMessageParams) => Promise<Message>;
  findById: ({ _id }: FindByIdParams) => Promise<Conversation | null>;
  rateMessage: ({
    conversationId,
    messageId,
    rating,
  }: RateMessageParams) => Promise<boolean>;
}

/**
 OSS_TODO: make these configurable from the entry point. though i think these messages are reasonable defaults
 */
export const conversationConstants = {
  NO_RELEVANT_CONTENT: `Unfortunately, I do not know how to respond to your message.

Please try to rephrase your message. Adding more details can help me respond with a relevant answer.`,
  LLM_NOT_WORKING: `Unfortunately, my chat functionality is not working at the moment,
so I cannot respond to your message. Please try again later.

However, here are some links that might provide some helpful information for your message:`,
};

/**
  Create conversation service that uses MongoDB as a data store.
 */
export function makeMongoDBConversationsService(
  database: Db,
  systemPrompt: SystemPrompt
): ConversationsService {
  const conversationsCollection =
    database.collection<Conversation>("conversations");
  return {
    async create({ ipAddress }: CreateConversationParams) {
      const newConversation = {
        _id: new ObjectId(),
        ipAddress,
        messages: [createMessageFromOpenAIChatMessage(systemPrompt)],
        createdAt: new Date(),
      };
      const insertResult = await conversationsCollection.insertOne(
        newConversation
      );

      if (
        !insertResult.acknowledged ||
        insertResult.insertedId !== newConversation._id
      ) {
        throw new Error("Failed to insert conversation");
      }
      return newConversation;
    },

    async addConversationMessage({
      conversationId,
      content,
      role,
      preprocessedContent,
      references,
    }: AddConversationMessageParams) {
      const newMessage = createMessageFromOpenAIChatMessage({
        role,
        content,
      });
      Object.assign(
        newMessage,
        preprocessedContent && { preprocessedContent: preprocessedContent },
        references && { references: references }
      );

      const updateResult = await conversationsCollection.updateOne(
        {
          _id: conversationId,
        },
        {
          $push: {
            messages: newMessage,
          },
        }
      );
      if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
        throw new Error("Failed to insert message");
      }
      return newMessage;
    },

    async findById({ _id }: FindByIdParams) {
      const conversation = await conversationsCollection.findOne({ _id });
      return conversation;
    },

    async rateMessage({
      conversationId,
      messageId,
      rating,
    }: RateMessageParams) {
      const updateResult = await conversationsCollection.updateOne(
        {
          _id: conversationId,
        },
        {
          $set: {
            "messages.$[message].rating": rating,
          },
        },
        {
          arrayFilters: [
            { "message.id": messageId, "message.role": "assistant" },
          ],
        }
      );
      if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
        throw new Error("Failed to rate message");
      }
      return true;
    },
  };
}

/**
  Create a `Message` object from the `OpenAiChatMessage` object.
 */
export function createMessageFromOpenAIChatMessage(
  chatMessage: OpenAiChatMessage
): Message {
  return {
    id: new ObjectId(),
    role: chatMessage.role,
    content: chatMessage.content,
    createdAt: new Date(),
  };
}
