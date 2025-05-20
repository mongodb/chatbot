import { uploadDatasetToBraintrust } from "mongodb-rag-core/braintrust";
import { DATASET_NAME, PROJECT_NAME } from "./config";
import { BRAINTRUST_ENV_VARS, assertEnvVars } from "mongodb-rag-core";
import path from "path";
import { createOpenAI } from "@ai-sdk/openai";
import { getOpenAiEndpointAndApiKey, models } from "mongodb-rag-core/models";
import { strict as assert } from "assert";
import PromisePool from "@supercharge/promise-pool";
import { loadDocs100QACsv, parseDocs100QARow } from "../../loadDocs100Dataset";

async function main() {
  const { BRAINTRUST_API_KEY } = assertEnvVars({
    ...BRAINTRUST_ENV_VARS,
  });

  const modelLabel = "gpt-4.1";
  const modelConfig = models.find((m) => m.label === modelLabel);
  assert(modelConfig, `Model ${modelLabel} not found`);

  const openai = createOpenAI({
    ...(await getOpenAiEndpointAndApiKey(modelConfig)),
  });
  const csvPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "testData",
    "docs_100_qa.csv"
  );

  console.log(`Loading dataset from ${csvPath}`);
  const { results: dataset } = await PromisePool.withConcurrency(
    // Dividing by 3 b/c there are 3 concurrent llm calls
    modelConfig.maxConcurrency / 3
  )
    .for(loadDocs100QACsv(csvPath))
    .handleError((error, row) => {
      console.error(
        `Error processing row for question: ${row.Question}`,
        error
      );
    })
    .process(async (row) => {
      return await parseDocs100QARow(row, openai.languageModel(modelLabel));
    });

  console.log(`Loaded ${dataset.length} records`);
  console.log(`Total number of records: ${dataset.length}`);
  const res = await uploadDatasetToBraintrust({
    apiKey: BRAINTRUST_API_KEY,
    datasetName: DATASET_NAME,
    projectName: PROJECT_NAME,
    description:
      "Docs 100 prompt completion dataset. Created by Docs team, May 2025.",
    dataset,
  });
  console.log(res);
}
main();
