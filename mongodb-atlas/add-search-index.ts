/**
 * @fileoverview This script adds a search index to a collection in a MongoDB Atlas cluster.
 *
 * Note that the script returns a 403 Forbidden if the index already exists.
 */
import { request } from "urllib";
import dotenv from "dotenv";

const [_, __, envFile] = process.argv;
dotenv.config({ path: envFile });

const {
  GROUP_ID,
  CLUSTER_NAME,
  DB_NAME,
  COLL_NAME,
  ATLAS_ADMIN_API_KEY,
  ATLAS_ADMIN_API_SECRET,
} = process.env;
console.log({
  GROUP_ID,
  CLUSTER_NAME,
  DB_NAME,
  COLL_NAME,
  ATLAS_ADMIN_API_KEY,
  ATLAS_ADMIN_API_SECRET,
});
const requestUrl = `https://cloud.mongodb.com/api/atlas/v2/groups/${GROUP_ID}/clusters/${CLUSTER_NAME}/fts/indexes`;

const payload = {
  name: "default",
  database: DB_NAME,
  collectionName: COLL_NAME,
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
