import { uploadDatasetToBraintrust } from "mongodb-rag-core/braintrust";
import { DATASET_NAME, PROJECT_NAME } from "./config";
import { BRAINTRUST_ENV_VARS, assertEnvVars } from "mongodb-rag-core";
import path from "path";
import {
  filterTechSupportQARow,
  loadTechSupportQACsv,
  parseTechSupportQARow,
} from "../../loadTechSupportDataset";

async function main() {
  const { BRAINTRUST_API_KEY } = assertEnvVars({
    ...BRAINTRUST_ENV_VARS,
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
  const dataset = loadTechSupportQACsv(csvPath)
    .filter(filterTechSupportQARow)
    .map(parseTechSupportQARow);

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
