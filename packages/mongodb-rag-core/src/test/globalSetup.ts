import { MongoMemoryServer, MongoMemoryReplSet } from "mongodb-memory-server";
import { IP, REPLICA_SET_PORT, SERVER_PORT } from "./constants";

declare global {
  var __MONGO_MEMORY_SERVER_INSTANCE: MongoMemoryServer;
  var __MONGO_MEMORY_REPLICA_SET: MongoMemoryReplSet;
}

module.exports = async function () {
  try {
    const mongoMemoryServerInstance = await MongoMemoryServer.create({
      instance: {
        port: SERVER_PORT,
        ip: IP,
      },
    });
    global.__MONGO_MEMORY_SERVER_INSTANCE = mongoMemoryServerInstance;
    const mongoMemoryServerReplicaSet = await MongoMemoryReplSet.create({
      instanceOpts: [
        {
          port: REPLICA_SET_PORT,
        },
      ],
      replSet: {
        ip: IP,
      },
    });
    global.__MONGO_MEMORY_REPLICA_SET = mongoMemoryServerReplicaSet;
  } catch (error) {
    console.error("Error in global setup:", error);
    throw error;
  }
};
