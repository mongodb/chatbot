import { ObjectId } from "mongodb-rag-core";

export interface CommandRunMetadata {
  _id: ObjectId;
  commandName: string;
  startTime: Date;
  endTime: Date;
}
export interface CommandMetadataStore {
  insertOne(command: Omit<CommandRunMetadata, "_id">): Promise<boolean>;
  findById(commandId: ObjectId): Promise<CommandRunMetadata | undefined>;
}

// TODO: implement
export function makeMongoDbCommandMetadataStore(): CommandMetadataStore {
  return {
    async insertOne(command) {
      return true;
    },
    async findById(commandId) {
      return undefined;
    },
  };
}
