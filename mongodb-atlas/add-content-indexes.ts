/**
 * @fileoverview This script adds a compound index to the content metadata & chunked embeddings collections.
 *
 */
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { getEnvironmentValue } from "./utils";

const [_, __, envFile] = process.argv;
dotenv.config({ path: envFile });

const MONGODB_CONNECTION_URI = getEnvironmentValue("MONGODB_CONNECTION_URI");
const DB_NAME = getEnvironmentValue("DB_NAME");
const CONTENT_METADATA_COLL_NAME = getEnvironmentValue("CONTENT_METADATA_COLL_NAME");
const EMBEDDED_CONTENT_COLL_NAME = getEnvironmentValue("EMBEDDED_CONTENT_COLL_NAME");

console.log("Creating a content index with the following parameters:", {
  DB_NAME,
  CONTENT_METADATA_COLL_NAME,
  EMBEDDED_CONTENT_COLL_NAME,
});

(async function createContentIndexes() {
  const client = new MongoClient(MONGODB_CONNECTION_URI);

  try {
    await client.connect();

    const contentMetadataCollection = client
      .db(DB_NAME)
      .collection(CONTENT_METADATA_COLL_NAME);

    const embeddedContentCollection = client
      .db(DB_NAME)
      .collection(EMBEDDED_CONTENT_COLL_NAME);

    // Create a compound index on the "sourceName" and "url" fields for both collections
    await Promise.all([
      contentMetadataCollection.createIndex({ sourceName: 1, url: 1 }),
      embeddedContentCollection.createIndex({ sourceName: 1, url: 1 }),
    ]);

    console.log("Content indexes created successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
})();
