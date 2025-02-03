import { ObjectId, Db } from "mongodb";
import {
  ConversationConstants,
  defaultConversationConstants,
  ConversationsService,
  Conversation,
  CreateConversationParams,
  AddConversationMessageParams,
  FindByIdParams,
  RateMessageParams,
  Message,
  UserMessage,
  AddManyConversationMessagesParams,
  AddSomeMessageParams,
  AssistantMessage,
  SystemMessage,
  FunctionMessage,
  CommentMessageParams,
} from "./ConversationsService";

/**
  Create {@link ConversationsService} that uses MongoDB as a data store.
 */
export function makeMongoDbConversationsService(
  database: Db,
  conversationConstants: ConversationConstants = defaultConversationConstants
): ConversationsService {
  const conversationsCollection =
    database.collection<Conversation>("conversations");
  return {
    conversationConstants,
    async create(params?: CreateConversationParams) {
      const customData = params?.customData;
      const initialMessages = params?.initialMessages;
      const newConversation = {
        _id: new ObjectId(),
        messages: initialMessages
          ? initialMessages?.map(createMessageFromOpenAIChatMessage)
          : [],
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

    async commentMessage({
      conversationId,
      messageId,
      comment,
    }: CommentMessageParams) {
      const updateResult = await conversationsCollection.updateOne(
        {
          _id: conversationId,
          messages: {
            $elemMatch: {
              id: messageId,
              role: "assistant",
            },
          },
        },
        {
          $set: {
            "messages.$[message].userComment": comment,
          },
        },
        {
          arrayFilters: [{ "message.id": messageId }],
        }
      );

      if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
        throw new Error("Failed to save comment on message");
      }
      return true;
    },
  };
}

export function createMessage(messageParams: AddSomeMessageParams) {
  const message = {
    ...messageParams,
    createdAt: new Date(),
    id: messageParams.id ?? new ObjectId(),
  } satisfies Message;

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
export function createMessageFromOpenAIChatMessage(
  chatMessage: AddSomeMessageParams
): Message {
  const dbMessageBase = {
    id: new ObjectId(),
    createdAt: new Date(),
    ...(chatMessage.customData ? { customData: chatMessage.customData } : {}),
  };

  // Avoid MongoDB inserting null for undefineds
  if (chatMessage.role === "user") {
    return {
      ...dbMessageBase,
      role: chatMessage.role,
      content: chatMessage.content,
      embedding: chatMessage.embedding ?? [],
    } satisfies UserMessage;
  }
  if (chatMessage.role === "assistant") {
    return {
      ...dbMessageBase,
      role: chatMessage.role,
      content: chatMessage.content ?? "",
      ...(chatMessage.functionCall
        ? { functionCall: chatMessage.functionCall }
        : {}),
    } satisfies AssistantMessage;
  }
  if (chatMessage.role === "system") {
    return {
      ...dbMessageBase,
      role: chatMessage.role,
      content: chatMessage.content,
    } satisfies SystemMessage;
  }
  if (chatMessage.role === "function") {
    return {
      ...dbMessageBase,
      role: chatMessage.role,
      content: chatMessage.content ?? "",
      name: chatMessage.name,
    } satisfies FunctionMessage;
  }
  throw new Error(`Invalid message for message: ${chatMessage}`);
}
