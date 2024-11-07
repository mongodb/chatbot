import {
  AggregateOptions,
  Document,
  Filter,
  MongoClient,
  ObjectId,
} from "mongodb-rag-core/mongodb";

export interface EvalResult {
  _id: ObjectId;
  generatedDataId: ObjectId;
  commandRunMetadataId: ObjectId;

  /**
    Name of the type of evaluation.
   */
  type: string;

  /**
    Number between 0 and 1, inclusive.
   */
  result: number;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface EvaluationStore {
  insertOne(evalResult: EvalResult): Promise<boolean>;
  insertMany(evalResults: EvalResult[]): Promise<boolean>;
  find(filter: unknown): Promise<EvalResult[] | undefined>;
  aggregate(pipeline: unknown[], options?: unknown): Promise<Document[]>;
  close(): Promise<void>;
}

export interface MakeMongoDbEvaluationStoreParams {
  connectionUri: string;
  databaseName: string;
  /**
    @default "evaluations"
   */
  collectionName?: string;
}

export interface MongoDbEvaluationStore extends EvaluationStore {
  find(filter: Filter<EvalResult>): Promise<EvalResult[] | undefined>;
  aggregate(
    pipeline: Document[],
    options?: AggregateOptions
  ): Promise<Document[]>;
}

export function makeMongoDbEvaluationStore({
  connectionUri,
  databaseName,
  collectionName,
}: MakeMongoDbEvaluationStoreParams): MongoDbEvaluationStore {
  const client = new MongoClient(connectionUri);
  const collection = client
    .db(databaseName)
    .collection<EvalResult>(collectionName ?? "evaluations");

  return {
    async insertOne(evalResult) {
      const { acknowledged } = await collection.insertOne(evalResult);
      return acknowledged;
    },
    async insertMany(evalResults) {
      const { acknowledged } = await collection.insertMany(evalResults);
      return acknowledged;
    },
    async find(filter) {
      const cursor = await collection.find(filter);
      return await cursor.toArray();
    },
    async aggregate(pipeline, options) {
      const cursor = await collection.aggregate<EvalResult>(pipeline, options);
      return await cursor.toArray();
    },
    async close() {
      await client.close();
    },
  };
}
