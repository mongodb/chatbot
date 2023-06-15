import { ObjectId, Db, Collection } from "mongodb";
import { MongoDB } from "../integrations/mongodb";
import { OpenAiChatMessage, SYSTEM_PROMPT } from "../integrations/openai";
import { ChatMessage } from "@azure/openai";

export interface CreateConversationParams {
  ipAddress: string;
}
export interface AddMessageParams {
  conversationId: ObjectId;
  answer: string;
}
export interface FindByIdParams {
  _id: ObjectId;
}
export interface RateMessageParams {
  conversationId: string;
  messageId: string;
  rating: boolean;
}
export interface ConversationsServiceInterface {
  create: ({ ipAddress }: CreateConversationParams) => Promise<Conversation>;
  addUserMessage: ({
    conversationId,
    answer,
  }: AddMessageParams) => Promise<boolean>;
  findById: ({ _id }: FindByIdParams) => Promise<Conversation | null>;
  rateMessage: ({
    conversationId,
    messageId,
    rating,
  }: RateMessageParams) => Promise<boolean>;
}

export class ConversationsService implements ConversationsServiceInterface {
  private database: Db;
  private conversationsCollection: Collection<Conversation>;
  constructor(database: Db) {
    this.database = database;
    this.conversationsCollection =
      this.database.collection<Conversation>("conversations");
  }
  async create({ ipAddress }: CreateConversationParams) {
    const newConversation = {
      _id: new ObjectId(),
      ipAddress,
      messages: [this.createMessageFromChatMessage(SYSTEM_PROMPT)],
      timeCreated: new Date(),
    };
    const insertResult = await this.conversationsCollection.insertOne(
      newConversation
    );

    if (
      !insertResult.acknowledged ||
      insertResult.insertedId !== newConversation._id
    ) {
      throw new Error("Failed to insert conversation");
    }
    return newConversation;
  }

  // TODO: figure out why getting error on _id
  async addUserMessage({ conversationId, answer }: AddMessageParams) {
    const newMessage = this.createMessageFromChatMessage({
      role: "user",
      content: answer,
    });
    const updateResult = await this.conversationsCollection.updateOne(
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
    return true;
  }

  async findById({ _id }: FindByIdParams) {
    const conversation = await this.conversationsCollection.findOne({ _id });
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    return conversation;
  }

  async rateMessage({ conversationId, messageId, rating }: RateMessageParams) {
    const updateResult = await this.conversationsCollection.updateOne(
      {
        _id: conversationId,
        "messages.id": messageId,
      },
      {
        $set: {
          "messages.$.rating": rating,
        },
      }
    );
    if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
      throw new Error("Failed to rate message");
    }
    return true;
  }

  private createMessageFromChatMessage(
    chatMessage: OpenAiChatMessage
  ): Message {
    return {
      id: new ObjectId(),
      role: chatMessage.role,
      content: chatMessage.content,
      timeCreated: new Date(),
    };
  }
}
