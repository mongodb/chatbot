/**
 * @fileoverview This script adds a search index to a collection in a MongoDB Atlas cluster.
 *
 * Note that the script returns a 403 Forbidden if the index already exists.
 */
import { request } from "urllib";
import dotenv from "dotenv";
import { getEnvironmentValue } from "./utils";

const [_, __, envFile] = process.argv;
dotenv.config({ path: envFile });

const GROUP_ID = getEnvironmentValue("GROUP_ID");
const CLUSTER_NAME = getEnvironmentValue("CLUSTER_NAME");
const DB_NAME = getEnvironmentValue("DB_NAME");
const EMBEDDED_CONTENT_COLL_NAME = getEnvironmentValue(
  "EMBEDDED_CONTENT_COLL_NAME"
);
const ATLAS_ADMIN_API_KEY = getEnvironmentValue("ATLAS_ADMIN_API_KEY");
const ATLAS_ADMIN_API_SECRET = getEnvironmentValue("ATLAS_ADMIN_API_SECRET");
const ATLAS_VECTOR_SEARCH_INDEX_NAME = getEnvironmentValue(
  "ATLAS_VECTOR_SEARCH_INDEX_NAME"
);
console.log("Creating a search index with the following parameters:", {
  GROUP_ID,
  CLUSTER_NAME,
  DB_NAME,
  EMBEDDED_CONTENT_COLL_NAME,
  ATLAS_VECTOR_SEARCH_INDEX_NAME,
});

const requestUrl = `https://cloud.mongodb.com/api/atlas/v2/groups/${GROUP_ID}/clusters/${CLUSTER_NAME}/fts/indexes`;

const payload = {
  name: ATLAS_VECTOR_SEARCH_INDEX_NAME,
  database: DB_NAME,
  collectionName: EMBEDDED_CONTENT_COLL_NAME,
  mappings: {
    fields: {
      embedding: {
        dimensions: 1536,
        similarity: "cosine",
        type: "knnVector",
      },
      sourceName: {
        analyzer: "lucene.keyword",
        type: "string",
      },
    },
  },
};

(async () => {
  const { data, res } = await request(requestUrl, {
    method: "POST",
    headers: {
      Accept: "application/vnd.atlas.2023-02-01+json",
      "content-type": "application/json",
    },
    digestAuth: `${ATLAS_ADMIN_API_KEY}:${ATLAS_ADMIN_API_SECRET}`,
    data: payload,
  });
  console.dir(res);
})();
