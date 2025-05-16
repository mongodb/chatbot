import {
  assertEnvVars,
  CORE_OPENAI_CHAT_COMPLETION_ENV_VARS,
  makeMongoDbPageStore,
} from "mongodb-rag-core";
import { synthesizePages } from "../synthesizePages.js";
import "dotenv/config";
import { OpenAI } from "mongodb-rag-core/openai";
import fs from "fs";

const urls = [
  // Section 2: Guiding tips and principles
  "https://www.practical-mongodb-aggregations.com/guides/guides",
  "https://www.practical-mongodb-aggregations.com/guides/composibility",
  "https://www.practical-mongodb-aggregations.com/guides/project",
  "https://www.practical-mongodb-aggregations.com/guides/explain",
  "https://www.practical-mongodb-aggregations.com/guides/performance",
  "https://www.practical-mongodb-aggregations.com/guides/expressions",
  // "https://www.practical-mongodb-aggregations.com/guides/sharding",
  "https://www.practical-mongodb-aggregations.com/guides/advanced-arrays",
  // Section 3: Aggregations by examples
  "https://www.practical-mongodb-aggregations.com/examples/examples",
  // Section 3.1: Foundational examples
  "https://www.practical-mongodb-aggregations.com/examples/foundational/foundational",
  "https://www.practical-mongodb-aggregations.com/examples/foundational/filtered-top-subset",
  "https://www.practical-mongodb-aggregations.com/examples/foundational/group-and-total",
  "https://www.practical-mongodb-aggregations.com/examples/foundational/unpack-array-group-differently",
  "https://www.practical-mongodb-aggregations.com/examples/foundational/distinct-values",
  // Section 3.2: Joining data examples
  "https://www.practical-mongodb-aggregations.com/examples/joining/joining",
  "https://www.practical-mongodb-aggregations.com/examples/joining/one-to-one-join",
  "https://www.practical-mongodb-aggregations.com/examples/joining/multi-one-to-many",
  // Section 3.3: Data type conversion examples
  "https://www.practical-mongodb-aggregations.com/examples/type-convert/type-convert",
  "https://www.practical-mongodb-aggregations.com/examples/type-convert/convert-to-strongly-typed",
  "https://www.practical-mongodb-aggregations.com/examples/type-convert/convert-incomplete-dates",
  // Section 3.4: Trend analysis examples
  "https://www.practical-mongodb-aggregations.com/examples/trend-analysis/trend-analysis",
  "https://www.practical-mongodb-aggregations.com/examples/trend-analysis/faceted-classifications",
  "https://www.practical-mongodb-aggregations.com/examples/trend-analysis/largest-graph-network",
  "https://www.practical-mongodb-aggregations.com/examples/trend-analysis/incremental-analytics",
  // Section 3.5: Securing data examples
  "https://www.practical-mongodb-aggregations.com/examples/securing-data/securing-data",
  "https://www.practical-mongodb-aggregations.com/examples/securing-data/redacted-view",
  "https://www.practical-mongodb-aggregations.com/examples/securing-data/mask-sensitive-fields",
  "https://www.practical-mongodb-aggregations.com/examples/securing-data/role-programmatic-restricted-view",
  // Section 3.6: Time-series examples
  "https://www.practical-mongodb-aggregations.com/examples/time-series/time-series",
  "https://www.practical-mongodb-aggregations.com/examples/time-series/iot-power-consumption",
  "https://www.practical-mongodb-aggregations.com/examples/time-series/state-change-boundaries",
  // Section 3.7: Array Manipulation examples
  "https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-manipulations",
  "https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-high-low-avg",
  "https://www.practical-mongodb-aggregations.com/examples/array-manipulations/pivot-array-items",
  "https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-sort-percentiles",
  "https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-element-grouping",
  "https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-fields-joining",
  "https://www.practical-mongodb-aggregations.com/examples/array-manipulations/comparison-of-two-arrays",
  // Note: not including section 3.8, full text search
  "https://www.practical-mongodb-aggregations.com/appendices/cheatsheet",
];

const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } = assertEnvVars({
  ...CORE_OPENAI_CHAT_COMPLETION_ENV_VARS,
  MONGODB_CONNECTION_URI: "",
  MONGODB_DATABASE_NAME: "",
});

export async function main() {
  const model = "o3-mini";

  console.log("starting script");
  const pageStore = makeMongoDbPageStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });

  const summary = await synthesizePages({
    topic: "MongoDB Aggregations",
    pageStore,
    model,
    openAiClient: new OpenAI({
      apiKey: process.env.OPENAI_OPENAI_API_KEY,
    }),
    urls,
  });
  const fileName = `practicalAggregationsSummary_${model}.md`;
  console.log("writing summary to file", fileName);
  fs.writeFileSync(fileName, summary, "utf-8");
  await pageStore.close();
  console.log("done");
}

main();
