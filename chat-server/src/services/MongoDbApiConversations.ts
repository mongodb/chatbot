import { Collection, MongoClient, ObjectId } from "mongodb";
import { SystemPrompt } from "./ChatLlm";
import {
  CreateConversationParams,
  FindByIdParams,
  RateMessageParams,
  SomeMessage,
  Message,
  SystemMessage,
} from "./conversations";
import {
  ApiConversation,
  ApiConversationsService,
  AddApiConversationMessageParams,
  BaseMessage,
} from "./ApiConversations";
import { FunctionDefinition } from "@azure/openai";

/**
  Create {@link ApiConversationsService} that uses MongoDB as a data store.
 */
export function makeMongoDbApiConversationsService(
  mongoClient: MongoClient,
  databaseName: string,
  initialSystemPrompt: SystemPrompt,
  initialFunctions: FunctionDefinition[]
): ApiConversationsService {
  const conversationsCollection = mongoClient
    .db(databaseName)
    .collection<ApiConversation>("api_conversations");
  return {
    async create({ ipAddress }: CreateConversationParams) {
      const newConversation = {
        _id: new ObjectId(),
        ipAddress,
        messages: [
          createDatabaseMessageFromOpenAiChatMessage(
            initialSystemPrompt,
            initialFunctions
          ),
        ],
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

    async addApiConversationMessage({
      conversationId,
      message,
      newSystemPrompt,
      availableFunctions,
    }: AddApiConversationMessageParams) {
      let newMessage = createDatabaseMessageFromOpenAiChatMessage(
        message,
        availableFunctions
      );
      await mongoClient.withSession(async (session) => {
        await session.withTransaction(async () => {
          const currentSystemPrompt = await getSystemPrompt(
            conversationsCollection,
            conversationId
          );
          // update system prompt if necessary
          if (newSystemPrompt !== undefined) {
            const query = { "messages.role": "system" };
            const update = {
              $set: {
                "messages.$.content": newSystemPrompt,
              },
            };

            const updateSystemPromptResult =
              await conversationsCollection.updateOne(query, update);
            if (
              !updateSystemPromptResult.acknowledged &&
              updateSystemPromptResult.matchedCount === 0
            ) {
              throw new Error("Failed to update system prompt");
            }
          }
          newMessage = {
            ...newMessage,
            systemPrompt: newSystemPrompt ?? currentSystemPrompt.content,
          };

          const updateMessageResult = await conversationsCollection.updateOne(
            {
              _id: conversationId,
            },
            {
              $push: {
                messages: newMessage,
              },
            }
          );

          if (
            !updateMessageResult.acknowledged ||
            updateMessageResult.matchedCount === 0
          ) {
            throw new Error("Failed to insert message");
          }
        });
      });
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
  Helper function to get the system prompt from a conversation.
 */
async function getSystemPrompt(
  conversationsCollection: Collection<ApiConversation>,
  conversationId: ObjectId
): Promise<SystemMessage> {
  const conversation = await conversationsCollection.findOne({
    _id: conversationId,
  });
  if (!conversation) {
    throw new Error("Conversation not found");
  }
  if (conversation.messages.length === 0) {
    throw new Error("Conversation has no messages");
  }
  const previousSystemPrompt = conversation.messages.find(
    (message) => message.role === "system"
  ) as SystemMessage;
  if (!previousSystemPrompt) {
    throw new Error("Conversation has no system prompt");
  }
  return previousSystemPrompt;
}
/**
    Helper function. Create a {@link Message} object from the {@link BaseMessage} object.
   */
function createDatabaseMessageFromOpenAiChatMessage(
  message: BaseMessage,
  availableFunctions: FunctionDefinition[]
): SomeMessage {
  return {
    id: new ObjectId(),
    createdAt: new Date(),
    availableFunctions,
    ...message,
  } as SomeMessage;
}
