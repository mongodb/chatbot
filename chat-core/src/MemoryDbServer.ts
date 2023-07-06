import { MongoClient } from "mongodb";
import { MongoMemoryReplSet } from "mongodb-memory-server";

export type DbServer = {
  connectionUri: string;
  stop(): Promise<boolean>;
};

export const makeMemoryDbServer = async (): Promise<DbServer> => {
  const mongod = await MongoMemoryReplSet.create();
  const connectionUri = mongod.getUri();
  return {
    connectionUri,
    stop: () => mongod.stop(),
  };
};
