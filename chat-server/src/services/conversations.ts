import { OpenAiChatMessage, OpenAiMessageRole, SystemPrompt } from "./ChatLlm";
import { ObjectId, Db } from "mongodb";
import { References } from "chat-core";

export type Message = {
  /**
    Unique identifier for the message.
   */
  id: ObjectId;

  /**
    The role of the message in the conversation.
   */
  role: OpenAiMessageRole;

  /**
    Message that occurs in the conversation.
   */
  content: string;

  /**
    The date the message was created.
   */
  createdAt: Date;
};

export type SystemMessage = Message & {
  role: "system";
};

export type AssistantMessage = Message & {
  role: "assistant";

  /**
    Set to `true` if the user liked the response, `false` if the user didn't
    like the response. No value if user didn't rate the response. Note that only
    messages with `role: "assistant"` can be rated.
   */
  rating?: boolean;

  /**
    Further reading links for the message.
   */
  references: References;
};

export type UserMessage = Message & {
  role: "user";

  /**
    The preprocessed content of the message that is sent to vector search.
   */
  preprocessedContent?: string;

  /**
    Whether preprocessor suggested not to answer based on the input.
   */
  rejectQuery?: boolean;

  /**
    The vector representation of the message content.
   */
  embedding: number[];
};

export type SomeMessage = UserMessage | AssistantMessage | SystemMessage;

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

  /**
    The vector representation of the message content.
   */
  embedding?: number[];

  rejectQuery?: boolean;
}
export interface FindByIdParams {
  _id: ObjectId;
}
export interface RateMessageParams {
  conversationId: ObjectId;
  messageId: ObjectId;
  rating: boolean;
}
export interface ConversationsService {
  create: ({ ipAddress }: CreateConversationParams) => Promise<Conversation>;
  addConversationMessage: (
    params: AddConversationMessageParams
  ) => Promise<Message>;
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

export function makeConversationsService(
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
      embedding,
      rejectQuery,
    }: AddConversationMessageParams) {
      const newMessage = createMessageFromOpenAIChatMessage({
        role,
        content,
        embedding,
      });
      Object.assign(
        newMessage,
        preprocessedContent && { preprocessedContent },
        references && { references },
        rejectQuery && { rejectQuery }
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

export function createMessageFromOpenAIChatMessage({
  role,
  content,
  embedding,
}: OpenAiChatMessage): SomeMessage {
  const message: Message = {
    id: new ObjectId(),
    role,
    content,
    createdAt: new Date(),
  };
  // Avoid MongoDB inserting null for undefineds
  if (role === "user" && embedding !== undefined) {
    (message as UserMessage).embedding = embedding;
  }
  return message as SomeMessage;
}
