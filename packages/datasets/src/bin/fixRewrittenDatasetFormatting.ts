import path from "path";
import fs from "fs";
import { DatabaseNlQueryDatasetEntryBraintrust } from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";
import { RewriteClassification } from "../treeGeneration/databaseNlQueries/rewriteNlQuery/rewriteNlQuery";
async function main() {
  const dataOutDir = path.join(__dirname, "..", "..", "dataOut");
  const datasetInPath = path.join(
    dataOutDir,
    "atlas-sample-dataset-claude-rewritten.1752073270894.json"
  );

  console.log("Reading dataset from", datasetInPath);

  const dataset = JSON.parse(fs.readFileSync(datasetInPath, "utf-8")) as {
    classification: RewriteClassification;
    datasetEntry: DatabaseNlQueryDatasetEntryBraintrust;
  }[];
  const fixedDataset = dataset.map((d) => d.datasetEntry);
  const pathOut = path.join(
    dataOutDir,
    "atlas-sample-dataset-claude-rewritten.json"
  );
  console.log("Writing fixed dataset to", pathOut);
  fs.writeFileSync(pathOut, JSON.stringify(fixedDataset, null, 2));
}
main();
