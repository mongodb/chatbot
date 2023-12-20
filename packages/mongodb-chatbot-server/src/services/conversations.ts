import { OpenAiChatMessage, SystemPrompt } from "./ChatLlm";
import { ObjectId, Db } from "mongodb-rag-core";
import {
  ConversationConstants,
  defaultConversationConstants,
  ConversationsService,
  Conversation,
  CreateConversationParams,
  AddConversationMessageParams,
  FindByIdParams,
  RateMessageParams,
  SomeMessage,
  Message,
  UserMessage,
  AddManyConversationMessagesParams,
  AddSomeMessageParams,
} from "./ConversationsService";

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
      const { conversationId, message } = params;
      const newMessage = createMessage(message);
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

    async addManyConversationMessages(
      params: AddManyConversationMessagesParams
    ) {
      const { messages, conversationId } = params;
      const newMessages = messages.map(createMessage);
      const updateResult = await conversationsCollection.updateOne(
        {
          _id: conversationId,
        },
        {
          $push: {
            messages: {
              $each: newMessages,
            },
          },
        }
      );
      if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
        throw new Error("Failed to insert message");
      }
      return newMessages;
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

export function createMessage(messageParams: AddSomeMessageParams) {
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
