import {
  ObjectId,
  Db,
  Collection,
  OpenAiChatMessage,
  OpenAiMessageRole,
} from "chat-core";
import { References } from "chat-core";
import { Llm } from "./llm";
import { LlmConfig } from "../AppConfig";

export interface Message {
  /** Unique identifier for the message. */
  id: ObjectId;
  /** The role of the message in the context of the conversation. */
  role: "system" | "assistant" | "user";
  /** Markdown-formatted response to user's chat message in the context of the conversation. */
  content: string;
  /** Set to `true` if the user liked the response, `false` if the user didn't like the response. No value if user didn't rate the response. Note that only messages with `role: "assistant"` can be rated. */
  rating?: boolean;
  /** The date the message was created. */
  createdAt: Date;
  /** Further reading links for the message. */
  references?: References;
}

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
export interface ConversationsServiceInterface {
  create: ({ ipAddress }: CreateConversationParams) => Promise<Conversation>;
  addConversationMessage: ({
    conversationId,
    content,
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

export const conversationConstants = {
  NO_RELEVANT_CONTENT: `Unfortunately, I do not know how to respond to your message.

Please try to rephrase your message. Adding more details can help me respond with a relevant answer.`,
  LLM_NOT_WORKING: `Unfortunately, my chat functionality is not working at the moment,
so I cannot respond to your message. Please try again later.

However, here are some links that might provide some helpful information for your message:`,
};

export class ConversationsService implements ConversationsServiceInterface {
  private database: Db;
  private conversationsCollection: Collection<Conversation>;
  private systemPrompt: LlmConfig["systemPrompt"];
  constructor(database: Db, systemPrompt: LlmConfig["systemPrompt"]) {
    this.database = database;
    this.conversationsCollection =
      this.database.collection<Conversation>("conversations");
    this.systemPrompt = systemPrompt;
  }
  async create({ ipAddress }: CreateConversationParams) {
    const newConversation = {
      _id: new ObjectId(),
      ipAddress,
      messages: [this.createMessageFromChatMessage(this.systemPrompt)],
      createdAt: new Date(),
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

  async addConversationMessage({
    conversationId,
    content,
    role,
    references,
  }: AddConversationMessageParams) {
    const newMessage = this.createMessageFromChatMessage({ role, content });
    if (references) {
      newMessage.references = references;
    }

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
    return newMessage;
  }

  async findById({ _id }: FindByIdParams) {
    const conversation = await this.conversationsCollection.findOne({ _id });
    return conversation;
  }

  async rateMessage({ conversationId, messageId, rating }: RateMessageParams) {
    const updateResult = await this.conversationsCollection.updateOne(
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
  }

  private createMessageFromChatMessage(
    chatMessage: OpenAiChatMessage
  ): Message {
    return createMessageFromOpenAIChatMessage(chatMessage);
  }
}

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
