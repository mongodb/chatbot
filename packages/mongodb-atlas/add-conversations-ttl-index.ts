/**
 * @fileoverview This script adds a TTL index to the Chatbot conversations collection.
 *
 */
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { getEnvironmentValue } from "./utils";

const [_, __, envFile] = process.argv;
dotenv.config({ path: envFile });

const MONGODB_CONNECTION_URI = getEnvironmentValue("MONGODB_CONNECTION_URI");
const DB_NAME = getEnvironmentValue("DB_NAME");
const CONVERSATIONS_COLL_NAME = getEnvironmentValue("CONVERSATIONS_COLL_NAME");
const CONVERSATIONS_TTL_SECONDS = getEnvironmentValue("CONVERSATIONS_TTL_SECONDS");

const expireAfterSeconds = Number(CONVERSATIONS_TTL_SECONDS);
if (Number.isNaN(expireAfterSeconds) || expireAfterSeconds <= 0) {
  throw new Error(
    "CONVERSATIONS_TTL_SECONDS must be a positive integer between 0 and 2147483647"
  );
}

console.log("Creating a TTL index with the following parameters:", {
  DB_NAME,
  CONVERSATIONS_COLL_NAME,
  CONVERSATIONS_TTL_SECONDS,
});

(async function createTTLIndex() {
  const client = new MongoClient(MONGODB_CONNECTION_URI);

  try {
    await client.connect();

    const collection = client.db(DB_NAME).collection(CONVERSATIONS_COLL_NAME);

    // Create a TTL index on the "createdAt" field
    await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds });

    console.log("TTL index created successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
})();
