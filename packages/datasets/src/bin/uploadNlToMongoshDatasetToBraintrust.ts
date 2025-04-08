import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { uploadDatasetToBraintrust } from "../uploadDatasetToBraintrust";
import fs from "fs";
import path from "path";
import {
  convertDatabaseNlQueryDatasetEntryToBraintrust,
  DatabaseNlQueryDatasetEntry,
} from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";

const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

async function main() {
  const { BRAINTRUST_API_KEY } = assertEnvVars({
    ...BRAINTRUST_ENV_VARS,
  });
  const dataset = JSON.parse(
    fs.readFileSync(
      path.resolve(dataOutDir, "referenceAnswers.gpt-4o.json"),
      "utf-8"
    )
  ) as DatabaseNlQueryDatasetEntry[];
  console.log(`Total number of queries: ${dataset.length}`);
  console.log(`First query: ${JSON.stringify(dataset[0], null, 2)}`);
  const btDataset = dataset.map(convertDatabaseNlQueryDatasetEntryToBraintrust);
  const res = await uploadDatasetToBraintrust({
    apiKey: BRAINTRUST_API_KEY,
    datasetName: "atlas_sample_data_benchmark_gpt-4o",
    projectName: "natural-language-to-mongosh",
    description: "Natural language-to-Mongosh dataset",
    dataset: btDataset,
  });
  console.log(res);
}
main();
