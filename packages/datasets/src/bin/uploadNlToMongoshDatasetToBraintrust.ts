import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { uploadDatasetToBraintrust } from "../uploadDatasetToBraintrust";
import fs from "fs";
import path from "path";
import { DatabaseNlQueryDatasetEntry } from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";

const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

async function main() {
  const { BRAINTRUST_API_KEY } = assertEnvVars({
    ...BRAINTRUST_ENV_VARS,
  });
  const dataset = JSON.parse(
    fs.readFileSync(path.resolve(dataOutDir, "referenceAnswers.json"), "utf-8")
  ) as DatabaseNlQueryDatasetEntry[];
  console.log(`Total number of queries: ${dataset.length}`);
  console.log(`First query: ${JSON.stringify(dataset[0], null, 2)}`);
  const btDataset = dataset.map((entry) => {
    const tags = [entry.complexity, entry.language, entry.databaseName];
    return {
      input: {
        nlQuery: entry.nlQuery,
        databaseName: entry.databaseName,
      },
      expected: {
        dbQuery: entry.dbQuery,
        result: entry.result,
        executionTimeMs: entry.executionTimeMs,
      },
      tags,
      metadata: {
        complexity: entry.complexity,
        language: entry.language,
        methods: entry.methods,
        queryOperators: entry.queryOperators,
        generationUuid: entry.generationUuid,
      },
    };
  });
  const res = await uploadDatasetToBraintrust({
    apiKey: BRAINTRUST_API_KEY,
    datasetName: "atlas_sample_data_benchmark",
    projectName: "natural-language-to-mongosh",
    description: "Natural language-to-Mongosh dataset",
    dataset: btDataset,
  });
  console.log(res);
}
main();
