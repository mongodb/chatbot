import { ObjectId, Db, Collection } from "mongodb";
import { MongoDB } from "../integrations/mongodb";

interface CreateConversationParams {
  ipAddress: string;
}
interface AddMessageParams {
  conversationId: ObjectId;
  answer: string;
}
interface FindByIdParams {
  _id: ObjectId;
}
interface RateMessageParams {
  conversationId: string;
  messageId: string;
  rating: boolean;
}
interface ConversationsServiceInterface {
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

class ConversationsService implements ConversationsServiceInterface {
  private database: Db;
  private conversationsCollection: Collection<Conversation>;
  constructor(database: Db) {
    this.database = database;
    this.conversationsCollection =
      this.database.collection<Conversation>("conversations");
  }
  async create({ ipAddress }: CreateConversationParams) {
    const conversation = await this.conversationsCollection.insertOne({
      _id: new ObjectId(),
      ipAddress,
      messages: [SYSTEM_PROMPT],
      timeCreated: new Date(),
    });
    return conversation.ops[0];
  }
}
