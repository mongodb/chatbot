/**
 * @fileoverview This script adds a compound index to the content metadata & chunked embeddings collections.
 *
 */
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { getEnvironmentValue } from "./utils";

const [_, __, envFile] = process.argv;
dotenv.config({ path: envFile });

const MONGODB_CONNECTION_URI = getEnvironmentValue(
  process.env,
  "MONGODB_CONNECTION_URI"
);
const DB_NAME = getEnvironmentValue(process.env, "DB_NAME");
const CONTENT_METADATA_COLL_NAME = getEnvironmentValue(
  process.env,
  "CONTENT_METADATA_COLL_NAME"
);
const EMBEDDED_CONTENT_COLL_NAME = getEnvironmentValue(
  process.env,
  "EMBEDDED_CONTENT_COLL_NAME"
);

console.log("Creating a TTL index with the following parameters:", {
  DB_NAME,
  CONTENT_METADATA_COLL_NAME,
  EMBEDDED_CONTENT_COLL_NAME,
});

(async function createTTLIndex() {
  const client = new MongoClient(MONGODB_CONNECTION_URI);

  try {
    await client.connect();

    const contentMetadataCollection = client
      .db(DB_NAME)
      .collection(CONTENT_METADATA_COLL_NAME);

    const embeddedContentCollection = client
      .db(DB_NAME)
      .collection(EMBEDDED_CONTENT_COLL_NAME);

    // Create a TTL index on the "createdAt" field
    await Promise.all([
      contentMetadataCollection.createIndex({ sourceName: 1, url: 1 }),
      embeddedContentCollection.createIndex({ sourceName: 1, url: 1 }),
    ]);

    console.log("TTL index created successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
})();
