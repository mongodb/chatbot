// TODO: add DB methods relevant for this project
import { Db, MongoClient, ObjectId } from "mongodb";
import { logger } from "./logger";
import { ChatMessage } from "@azure/openai";

class MongoDBDatabase {
  private client: MongoClient;
  private db: Db;

  constructor(connectionUri: string, databaseName: string) {
    this.client = new MongoClient(connectionUri);
    this.db = this.client.db(databaseName);
    logger.info("Connected to MongoDB client successfully");
  }

  conversations = {
    addMessage: async ({
      conversation,
      answer,
    }: {
      conversation: Conversation;
      answer: ChatMessage;
    }) => {
      // TODO: implement this
      return true;
    },
    create: async ({ ipAddress }: { ipAddress: string }) => {
      // TODO: implement this
      return { id: "", ipAddress };
    },

    findById: async ({ id }: { id: string }) => {
      // TODO: implement this
      return {
        _id: new ObjectId(),
        ipAddress: "",
        messages: [],
        timeCreated: new Date(),
      };
    },

    rateMessage: async ({
      conversationId,
      messageId,
      rating,
    }: {
      conversationId: string;
      messageId: string;
      rating: boolean;
    }) => {
      // TODO: implement this
      return true;
    },
  };

  content = {
    findVectorMatches: async ({ embedding }: { embedding: number[] }) => {
      // TODO: implement this
      return [];
    },
  };

  closeDBConnection = async () => {
    await this.client.close();
    logger.info("MongoDB Client closed successfully");
  };
}

export const database = new MongoDBDatabase(
  process.env.MONGODB_CONNECTION_URI!,
  process.env.MONGODB_DB_NAME!
);
