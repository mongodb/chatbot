import { uploadDatasetToBraintrust } from "mongodb-rag-core/braintrust";
import { DATASET_NAME, PROJECT_NAME } from "./config";
import { BRAINTRUST_ENV_VARS, assertEnvVars } from "mongodb-rag-core";
import path from "path";
import {
  filterTechSupportQARow,
  loadTechSupportQACsv,
  parseTechSupportQARow,
} from "../../loadTechSupportDataset";
import { createOpenAI } from "@ai-sdk/openai";
import { getOpenAiEndpointAndApiKey, models } from "mongodb-rag-core/models";
import { strict as assert } from "assert";
import PromisePool from "@supercharge/promise-pool";

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
    "ts_jan_questions_reviewed.csv"
  );

  console.log(`Loading dataset from ${csvPath}`);
  const { results: dataset } = await PromisePool.withConcurrency(
    // Dividing by 3 b/c there are 3 concurrent llm calls
    modelConfig.maxConcurrency / 3
  )
    .for(loadTechSupportQACsv(csvPath).filter(filterTechSupportQARow))
    .process(async (row) => {
      return await parseTechSupportQARow(row, openai.languageModel(modelLabel));
    });

  console.log(`Total number of records: ${dataset.length}`);
  const res = await uploadDatasetToBraintrust({
    apiKey: BRAINTRUST_API_KEY,
    datasetName: DATASET_NAME,
    projectName: PROJECT_NAME,
    description:
      "Tech support prompt completion dataset. Created by technical services team, January 2025.",
    dataset,
  });
  console.log(res);
}
main();
