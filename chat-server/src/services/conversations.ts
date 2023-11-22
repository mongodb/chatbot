import { OpenAiChatMessage, OpenAiMessageRole, SystemPrompt } from "./ChatLlm";
import { ObjectId, Db } from "mongodb-rag-core";
import { References } from "mongodb-rag-core";

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

  /**
    Custom data to include in the Message persisted to the database.
   */
  customData?: Record<string, unknown>;
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

/**
  Message in the {@link Conversation} as stored in the database.
 */
export type SomeMessage = UserMessage | AssistantMessage | SystemMessage;

export type ConversationCustomData = Record<string, unknown> | undefined;

/**
  Conversation between the user and the chatbot as stored in the database.
 */
export interface Conversation<
  CustomData extends ConversationCustomData = ConversationCustomData
> {
  _id: ObjectId;
  /** Messages in the conversation. */
  messages: Message[];
  /** The date the conversation was created. */
  createdAt: Date;
  /** The hostname that the request originated from. */
  requestOrigin?: string;

  /**
    Custom data to include in the Conversation persisted to the database.
    You can pass this data to the `create` method of the {@link ConversationsService}.
   */
  customData?: CustomData;
}
export type CreateConversationParams = {
  customData?: ConversationCustomData;
};

export type AddSystemMessageParams = Omit<SystemMessage, "id" | "createdAt"> & {
  conversationId: ObjectId;
};

export type AddUserMessageParams = Omit<UserMessage, "id" | "createdAt"> & {
  conversationId: ObjectId;
  customData?: Record<string, unknown>;
};

export type AddAssistantMessageParams = Omit<
  AssistantMessage,
  "id" | "createdAt"
> & {
  conversationId: ObjectId;
};

export type AddConversationMessageParams =
  | AddSystemMessageParams
  | AddUserMessageParams
  | AddAssistantMessageParams;

export interface FindByIdParams {
  _id: ObjectId;
}
export interface RateMessageParams {
  conversationId: ObjectId;
  messageId: ObjectId;
  rating: boolean;
}

/**
 Static responses to send in pre-defined edge case scenarios.
 */
export interface ConversationConstants {
  /**
    Response message sent when the user sends a message that the chatbot
    that doesn't match anything in the chatbot's knowledge base.
   */
  NO_RELEVANT_CONTENT: string;
  /**
    Response message sent when the chatbot's LLM is not working.
   */
  LLM_NOT_WORKING: string;
}
/**
  Service for managing {@link Conversation}s.
 */
export interface ConversationsService {
  conversationConstants: ConversationConstants;
  create: (params?: CreateConversationParams) => Promise<Conversation>;
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

export const defaultConversationConstants = {
  NO_RELEVANT_CONTENT: `Unfortunately, I do not know how to respond to your message.

Please try to rephrase your message. Adding more details can help me respond with a relevant answer.`,
  LLM_NOT_WORKING: `Unfortunately, my chat functionality is not working at the moment,
so I cannot respond to your message. Please try again later.

However, here are some links that might provide some helpful information for your message:`,
};

/**
  Create {@link ConversationsService} that uses MongoDB as a data store.
 */
export function makeMongoDbConversationsService(
  database: Db,
  systemPrompt: SystemPrompt,
  conversationConstants: ConversationConstants = defaultConversationConstants
): ConversationsService {
  const conversationsCollection =
    database.collection<Conversation>("conversations");
  return {
    conversationConstants,
    async create(params?: CreateConversationParams) {
      const customData = params?.customData;
      const newConversation = {
        _id: new ObjectId(),
        messages: [createMessageFromOpenAIChatMessage(systemPrompt)],
        createdAt: new Date(),
        // Conditionally include `customData` only if it's not undefined
        // Otherwise MongoDB adds it as `customData: null`,
        // which we don't want.
        ...(customData !== undefined && { customData }),
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

    async addConversationMessage(params: AddConversationMessageParams) {
      const newMessage = createMessage(params);
      const updateResult = await conversationsCollection.updateOne(
        {
          _id: params.conversationId,
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

export function createMessage(messageParams: AddConversationMessageParams) {
  const message = {
    id: new ObjectId(),
    createdAt: new Date(),
    ...messageParams,
  } satisfies SomeMessage;

  // Remove undefined customData so that it's
  // not persisted to the database as `customData: null`.
  if (messageParams.customData === undefined) {
    delete message.customData;
  }
  return message;
}

/**
  Create a {@link Message} object from the {@link OpenAiChatMessage} object.
 */
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
