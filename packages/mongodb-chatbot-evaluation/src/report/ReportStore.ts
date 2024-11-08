import { Filter, MongoClient, ObjectId } from "mongodb-rag-core/mongodb";

export interface Report {
  _id: ObjectId;

  /**
    The type of the report.
   */
  type: string;

  /**
    The name passed from the command that was run.
   */
  name: string;
  commandRunMetadataId: ObjectId;
  data: Record<string, unknown>;
  createdAt: Date;
}

export interface ReportStore {
  insertOne(evalResult: Report): Promise<boolean>;
  find(filter: unknown): Promise<Report[] | undefined>;
  close(): Promise<void>;
}

export interface MakeMongoDbReportStoreParams {
  connectionUri: string;
  databaseName: string;
  /**
    @default "reports"
   */
  collectionName?: string;
}

export interface MongoDbReportStore extends ReportStore {
  find(filter: Filter<Report>): Promise<Report[] | undefined>;
}

export function makeMongoDbReportStore({
  connectionUri,
  databaseName,
  collectionName,
}: MakeMongoDbReportStoreParams): MongoDbReportStore {
  const client = new MongoClient(connectionUri);
  const collection = client
    .db(databaseName)
    .collection<Report>(collectionName ?? "reports");

  return {
    async insertOne(report) {
      const { acknowledged } = await collection.insertOne(report);
      return acknowledged;
    },
    async find(filter) {
      const cursor = await collection.find(filter);
      return await cursor.toArray();
    },
    async close() {
      await client.close();
    },
  };
}
