import {
  Conversation,
  MessageBase,
  OpenAiChatMessage,
} from "mongodb-chatbot-server";
import { Filter, MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { QuizQuestionTestCaseData } from "./TestCase";

export interface BaseGeneratedData {
  _id: ObjectId;
  commandRunId: ObjectId;
  type: string;
  data: unknown;
  evalData?: Record<string, unknown>;
  createdAt: Date;
}

export interface ConversationGeneratedData extends BaseGeneratedData {
  type: "conversation";
  data: Conversation;
  evalData: ConversationEvalData;
}

export interface QuizGeneratedData extends BaseGeneratedData {
  type: "quiz";
  data: {
    modelAnswer: string;
  };
  evalData: QuizQuestionTestCaseData & {
    promptMessages: OpenAiChatMessage[];
    modelName: string;
  };
}
export type SomeGeneratedData =
  | QuizGeneratedData
  | ConversationGeneratedData
  | BaseGeneratedData;

export interface ConversationEvalData extends Record<string, unknown> {
  /**
    Arbitrary metadata about the conversation.
   */
  tags?: string[];

  /**
    Description of what you want to see from the final assistant message.
    An LLM can use this description to see if the final assistant message meets this expectation.
   */
  qualitativeFinalAssistantMessageExpectation?: string;

  /**
    Description of what the test case assesses.
   */
  name: string;

  /**
    Link segments expected to be included in the final assistant message.
   */
  expectedLinks?: string[];
}

export interface GeneratedDataStore {
  insertOne(generatedData: SomeGeneratedData): Promise<boolean>;
  insertMany(generatedData: SomeGeneratedData[]): Promise<boolean>;
  findById(generatedDataId: ObjectId): Promise<SomeGeneratedData | undefined>;
  findByCommandRunId(
    commandRunId: ObjectId
  ): Promise<SomeGeneratedData[] | undefined>;
  find(filter: unknown): Promise<SomeGeneratedData[] | undefined>;
  close(): Promise<void>;
}

export interface MakeMongoDbGeneratedDataStoreParams {
  connectionUri: string;
  databaseName: string;

  /**
    @default "generated_data"
   */
  collectionName?: string;
}

export interface MongoDbGeneratedDataStore extends GeneratedDataStore {
  find(
    filter: Filter<SomeGeneratedData>
  ): Promise<SomeGeneratedData[] | undefined>;
}

export function makeMongoDbGeneratedDataStore({
  connectionUri,
  databaseName,
  collectionName,
}: MakeMongoDbGeneratedDataStoreParams): MongoDbGeneratedDataStore {
  const client = new MongoClient(connectionUri);
  const collection = client
    .db(databaseName)
    .collection<SomeGeneratedData>(collectionName ?? "generated_data");
  return {
    async insertOne(generatedData) {
      const { acknowledged } = await collection.insertOne(generatedData);
      return acknowledged;
    },
    async insertMany(generatedData) {
      const { acknowledged } = await collection.insertMany(generatedData);
      return acknowledged;
    },
    async findById(generatedDataId) {
      return (await collection.findOne({ _id: generatedDataId })) ?? undefined;
    },
    async find(filter: Filter<SomeGeneratedData>) {
      const cursor = await collection.find(filter);
      return await cursor.toArray();
    },
    async findByCommandRunId(commandRunId: ObjectId) {
      const cursor = await collection.find({ commandRunId });
      return await cursor.toArray();
    },
    async close() {
      await client.close();
    },
  };
}
