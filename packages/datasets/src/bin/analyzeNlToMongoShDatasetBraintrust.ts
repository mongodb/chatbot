import fs from "fs";
import path from "path";
import {
  DatabaseNlQueryDatasetEntryBraintrustSchema,
  DatabaseNlQueryDatasetEntryBraintrust,
  convertBraintrustDatabaseNlQueryDatasetEntryToFlat,
} from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";
import { countAndLogUsage } from "../treeGeneration/databaseNlQueries/analyzeDataset";

async function main() {
  const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

  const dataset = fs.readFileSync(
    path.resolve(dataOutDir, "atlas_sample_dataset_manual_review.json"),
    "utf-8"
  );
  const datasetObjs: DatabaseNlQueryDatasetEntryBraintrust[] =
    DatabaseNlQueryDatasetEntryBraintrustSchema.array().parse(
      JSON.parse(dataset)
    );
  countAndLogUsage(
    datasetObjs.map(convertBraintrustDatabaseNlQueryDatasetEntryToFlat)
  );
}
main();
