import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";

export interface CommandRunMetadata {
  _id: ObjectId;
  command: "generate" | "evaluate" | "report";
  name: string;
  startTime: Date;
  endTime: Date;
}
export interface CommandMetadataStore {
  insertOne(command: CommandRunMetadata): Promise<boolean>;
  findById(commandId: ObjectId): Promise<CommandRunMetadata | undefined>;
  close(): Promise<void>;
}

export function convertCommandRunMetadataToJson(command: CommandRunMetadata) {
  return {
    _id: command._id.toHexString(),
    command: command.command,
    name: command.name,
    startTime: command.startTime.getTime(),
    endTime: command.endTime.getTime(),
  };
}

export interface MakeMongoDbCommandMetadataStoreParams {
  connectionUri: string;
  databaseName: string;

  /**
    @default "command_run_metadata"
   */
  collectionName?: string;
}

export function makeMongoDbCommandMetadataStore({
  connectionUri,
  databaseName,
  collectionName,
}: MakeMongoDbCommandMetadataStoreParams): CommandMetadataStore {
  const client = new MongoClient(connectionUri);
  const collection = client
    .db(databaseName)
    .collection<CommandRunMetadata>(collectionName ?? "command_run_metadata");

  return {
    async insertOne(command) {
      const { acknowledged } = await collection.insertOne(command);
      return acknowledged;
    },
    async findById(commandId) {
      return (await collection.findOne({ _id: commandId })) ?? undefined;
    },
    async close() {
      return await client.close();
    },
  };
}
