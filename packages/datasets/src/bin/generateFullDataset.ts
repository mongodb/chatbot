import fs from "fs";
import path from "path";
import readline from "readline";
import { DatabaseNlQueryDatasetEntry } from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";
import {
  countAndLogUsage,
  countStringProperty,
} from "../treeGeneration/databaseNlQueries/analyzeDataset";
import { isNonMutativeOperation } from "mongodb-rag-core/executeCode";

const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

async function main() {
  const textToMqlOutputPaths = [
    path.resolve(
      dataOutDir,
      "gpt-4o_1743796354104",
      "referenceAnswers.dataset_gpt-4o_1743796354104.jsonl"
    ),
    path.resolve(
      dataOutDir,
      "gpt-4o_temp_0.7_1743798673485",
      "referenceAnswers.dataset_gpt-4o_temp_0.7_1743798673485.jsonl"
    ),
  ];

  const allReferenceAnswers: DatabaseNlQueryDatasetEntry[] = [];
  for (const textToMqlOutputPath of textToMqlOutputPaths) {
    const generationUuid = path
      .basename(textToMqlOutputPath)
      .split(".")
      .slice(0, 2)
      .join("_");
    console.log(`Processing generation ${generationUuid}`);
    // Use readline interface to read the file line by line instead of loading it all at once
    const fileStream = fs.createReadStream(textToMqlOutputPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    let totalAnsCount = 0;
    const referenceAnswers = [];
    let mutativeOperationsCount = 0;
    let emptyResultCount = 0;

    // Count lines as we read them
    for await (const line of rl) {
      totalAnsCount++;
      if (line.trim() && line.includes(`"isReferenceAnswer":true`)) {
        const parsedLine = JSON.parse(line) as DatabaseNlQueryDatasetEntry;
        parsedLine.generationUuid = generationUuid;

        // Check if the entry contains mutative operations
        if (!isNonMutativeOperation(parsedLine.methods)) {
          mutativeOperationsCount++;
          continue;
        }

        // Check if the result is valid
        if (Array.isArray(parsedLine.result)) {
          if (parsedLine.result.length > 0) {
            referenceAnswers.push(parsedLine);
          } else {
            emptyResultCount++;
          }
        } else {
          referenceAnswers.push(parsedLine);
        }
      }
    }
    console.log("Processed dataset:", path.basename(textToMqlOutputPath));
    console.log(`Total answers: ${totalAnsCount}`);
    console.log(
      `Filtered out ${mutativeOperationsCount} entries with mutative operations`
    );
    console.log(`Filtered out ${emptyResultCount} entries with empty results`);
    console.log(`Text to MQL example count: ${referenceAnswers.length}`);
    const complexities = countStringProperty(referenceAnswers, "complexity");
    console.log("Complexities:", complexities);
    allReferenceAnswers.push(...referenceAnswers);
  }
  countAndLogUsage(allReferenceAnswers);
  const allReferenceAnswersPathOut = path.resolve(
    dataOutDir,
    "referenceAnswers.gpt-4o.json"
  );
  fs.writeFileSync(
    allReferenceAnswersPathOut,
    JSON.stringify(allReferenceAnswers, null, 2)
  );
  console.log(
    `Wrote ${allReferenceAnswers.length} reference answers to ${allReferenceAnswersPathOut}`
  );
}

main();
