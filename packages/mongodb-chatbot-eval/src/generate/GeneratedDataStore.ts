import { Filter, MongoClient, ObjectId } from "mongodb-rag-core";

export interface GeneratedData {
  _id: ObjectId;
  commandRunId: ObjectId;
  type: string;
  data: unknown;
  evalData?: Record<string, unknown>;
}

export interface GeneratedDataStore {
  insertOne(generatedData: GeneratedData): Promise<boolean>;
  findById(generatedDataId: ObjectId): Promise<GeneratedData | undefined>;
  find(filter: unknown): Promise<GeneratedData[] | undefined>;
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
  find(filter: Filter<GeneratedData>): Promise<GeneratedData[] | undefined>;
}

export function makeMongoDbGeneratedDataStore({
  connectionUri,
  databaseName,
  collectionName,
}: MakeMongoDbGeneratedDataStoreParams): MongoDbGeneratedDataStore {
  const client = new MongoClient(connectionUri);
  const collection = client
    .db(databaseName)
    .collection<GeneratedData>(collectionName ?? "generated_data");
  return {
    async insertOne(generatedData) {
      const { acknowledged } = await collection.insertOne(generatedData);
      return acknowledged;
    },
    async findById(generatedDataId) {
      return (await collection.findOne({ _id: generatedDataId })) ?? undefined;
    },
    async find(filter: Filter<GeneratedData>) {
      const cursor = await collection.find(filter);
      return await cursor.toArray();
    },
    async close() {
      await client.close();
    },
  };
}
