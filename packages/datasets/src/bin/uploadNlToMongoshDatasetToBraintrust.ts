import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { uploadDatasetToBraintrust } from "../uploadDatasetToBraintrust";
import fs from "fs";
import path from "path";

const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

async function main() {
  const { BRAINTRUST_API_KEY } = assertEnvVars({
    ...BRAINTRUST_ENV_VARS,
  });
  const dataset = JSON.parse(
    fs.readFileSync(
      path.resolve(
        dataOutDir,
        "atlas_sample_data_benchmark_gpt-4o_filtered_with_execution_time.json"
      ),
      "utf-8"
    )
  );
  console.log(`Total number of queries: ${dataset.length}`);
  console.log(`First query: ${JSON.stringify(dataset[0], null, 2)}`);
  const res = await uploadDatasetToBraintrust({
    apiKey: BRAINTRUST_API_KEY,
    datasetName:
      "atlas_sample_data_benchmark_gpt-4o_filtered_with_execution_time",
    projectName: "natural-language-to-mongosh",
    description:
      "Natural language-to-Mongosh dataset filtered to only include cases where more than 1 LLM was able to answer correctly.",
    dataset,
  });
  console.log(res);
}
main();
