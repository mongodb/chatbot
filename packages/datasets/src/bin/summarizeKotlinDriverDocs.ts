import {
  assertEnvVars,
  CORE_OPENAI_CHAT_COMPLETION_ENV_VARS,
  makeMongoDbPageStore,
} from "mongodb-rag-core";
import { synthesizePages } from "../synthesizePages.js";
import "dotenv/config";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import fs from "fs";

const {
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_ENDPOINT,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
} = assertEnvVars({
  ...CORE_OPENAI_CHAT_COMPLETION_ENV_VARS,
  MONGODB_CONNECTION_URI: "",
  MONGODB_DATABASE_NAME: "",
});

const urls: string[] = [
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/quick-start/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/quick-reference/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/whats-new/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/find-operations/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/findOne/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/find/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/insert-operations/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/insertOne/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/insertMany/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/update-operations/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/updateOne/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/updateMany/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/replaceOne/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/delete-operations/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/deleteMany/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/deleteOne/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/bulkWrite/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/watch/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/count/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/distinct/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/command/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/connect/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/connection-options/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/mongoclientsettings/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/network-compression/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/tls/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/socks5/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/auth/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/enterprise-auth/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/stable-api/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/databases-collections/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/document-data-format-data-class/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/document-data-format-bson/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/document-data-format-extended-json/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/documents/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/serialization/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/codecs/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/retrieve/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/flow/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/change-streams/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/sort/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/skip/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/limit/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/project/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/geo/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/text/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/insert/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/delete/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/modify/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/embedded-arrays/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/upsert/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/bulk/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/query-document/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/compound-operations/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/aggregates/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/vector-search/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/filters/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/indexes/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/projections/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/sort/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/updates/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/builders-data-classes/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/aggregation/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/aggregation-expression-operations/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/indexes/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/transactions/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/collations/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/logging/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/monitoring/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/time-series/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/encrypt-fields/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/api-documentation/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/faq/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/connection-troubleshooting/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/issues-and-help/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/compatibility/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/migrate-kmongo/",
  "https://mongodb.com/docs/drivers/kotlin/coroutine/current/validate-signatures/",
];
export async function main() {
  console.log("starting script");
  const pageStore = makeMongoDbPageStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });
  const summary = await synthesizePages({
    topic: "MongoDB Kotlin Driver",
    pageStore,
    model: "gpt-4o-mini",
    openAiClient: new AzureOpenAI({
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      apiVersion: OPENAI_API_VERSION,
    }),
    urls,
  });
  const fileName = "atlasVectorSearchSummary.md";
  console.log("writing summary to file", fileName);
  fs.writeFileSync(fileName, summary, "utf-8");
  await pageStore.close();
  console.log("done");
}

main();
