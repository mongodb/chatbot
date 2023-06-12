// TODO: add DB methods relevant for this project
import { Db, MongoClient, ObjectId } from 'mongodb';
import { logger } from './logger';

class MongoDBDatabase {
  private client: MongoClient;
  private db: Db;

  constructor(connectionUri: string, databaseName: string) {
    this.client = new MongoClient(connectionUri);
    this.db = this.client.db(databaseName);
    logger.info('Connected to MongoDB client successfully');
  }

  conversations = {
    addMessage: async ({ conversation, answer }: { conversation: Conversation; answer: string }) => {
      // TODO: implement this
      return true;
    },
    create: async ({ ip_address }: { ip_address: string }) => {
      // TODO: implement this
      return { id: '', ip_address };
    },

    findById: async ({ id }: { id: string }) => {
      // TODO: implement this
      return { id: '', ip_address: '', messages: [], time_created: new Date() };
    },

    rateMessage: async ({
      id,
      conversation,
      message_index,
      rating,
    }: {
      id: string;
      conversation: Message[];
      message_index: number;
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
    logger.info('MongoDB Client closed successfully');
  };
}

export const database = new MongoDBDatabase(process.env.MONGODB_CONNECTION_URI!, process.env.MONGODB_DB_NAME!);
