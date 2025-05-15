import {
  assertEnvVars,
  CORE_OPENAI_CHAT_COMPLETION_ENV_VARS,
  makeMongoDbPageStore,
} from "mongodb-rag-core";
import { synthesizePages } from "../synthesizePages.js";
import { synthesizeEvals } from "../synthesizeEvals.js";
import "dotenv/config";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import fs from "fs";
import path from "path";

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
  "https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-quick-start/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/create-embeddings/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-type/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/vector-quantization/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/rag/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/deployment-options/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-tutorial/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/reciprocal-rank-fusion/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/local-rag/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/evaluate-results/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/tune-vector-search/",
  "https://mongodb.com/docs/atlas/atlas-vector-search/troubleshooting/",
];
export async function main() {
  console.log("starting script");
  const pageStore = makeMongoDbPageStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });
  const summary = await synthesizePages({
    topic: "MongoDB Atlas Vector Search",
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
  const evals = await synthesizeEvals({
    topic: "MongoDB Atlas Vector Search",
    pageStore,
    model: "gpt-4o-mini",
    openAiClient: new AzureOpenAI({
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      apiVersion: OPENAI_API_VERSION,
    }),
    urls,
  });
  const evalsFileName = "atlas-vector-search.json";
  const evalsFilePath = path.join(
    __dirname,
    "..",
    "..",
    "synthesizedEvals",
    evalsFileName
  );
  console.log("writing evals to file", evalsFilePath);
  fs.writeFileSync(
    evalsFilePath,
    JSON.stringify(
      evals.flatMap(({ url, urlIndex, evals }) =>
        evals.map((e) => ({
          url,
          urlIndex,
          ...e,
        }))
      )
    ),
    "utf-8"
  );
  await pageStore.close();
  console.log("done");
}

main();
