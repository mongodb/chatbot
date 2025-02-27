/**
 # Generate Evaluation Cases YAML from CSV
 
 This script converts conversation evaluation cases from a CSV file to YAML format.
 It supports optional transformations of the evaluation cases during conversion.
 
 ## Usage
 
 Can be run through npm script or directly using node:
 
 ```bash
 npm run generate-eval-cases -- <csvFileName> <yamlFileName> [transformationType]
 ```
 
 Or:
 
 ```bash
 node generateEvalCasesYamlFromCSV.js <csvFileName> <yamlFileName> [transformationType]
 ```
 
 ### Arguments
 
 - `csvFilePath`: (Required) Absolute path to the input CSV file
 - `yamlFileName`: (Required) Name of the output YAML file (without .yml extension)
 - `transformationType`: (Optional) Type of transformation to apply to the cases
 
 ### Available Transformations
 
 - `web`: Adds a "web" tag to all evaluation cases
 
 ### File Paths
 
 - Output YAML files will be generated in: `evalCases/`
 
 ### Example
 
 ```bash
 npm run generate-eval-cases -- Users/first.lastname/Downloads/input-file.csv output-file-name web
 ```
 
 This will:
 1. Read from: /Users/first.lastname/Downloads/input-file.csv
 2. Apply the web transformation
 3. Write to: evalCases/output-file-name.yml
*/

import fs from "fs";
import path from "path";
import yaml from "yaml";
import {
  getConversationEvalCasesFromCSV,
  ConversationEvalCase,
} from "mongodb-rag-core/eval";

const SRC_ROOT = path.resolve(__dirname, "../");

function addWebDataSourceTag(evalCases: ConversationEvalCase[]) {
  return evalCases.map((caseItem) => {
    const tags = caseItem.tags || [];
    if (!tags.includes("web")) {
      tags.push("web");
    }
    return {
      ...caseItem,
      tags,
    };
  });
}

const transformationMap: Record<
  string,
  (cases: ConversationEvalCase[]) => ConversationEvalCase[]
> = {
  web: addWebDataSourceTag,
  // Add more transformation functions here as needed
};

async function main({
  csvFilePath,
  yamlFileName,
  transformationType,
}: {
  csvFilePath: string;
  yamlFileName: string;
  transformationType?: keyof typeof transformationMap;
}): Promise<void> {
  console.log(`Reading from: ${csvFilePath}`);
  const evalCases = await getConversationEvalCasesFromCSV(
    csvFilePath,
    transformationType ? transformationMap[transformationType] : undefined
  );
  const yamlFilePath = path.join(
    SRC_ROOT,
    `../../evalCases/${yamlFileName}.yml`
  );
  console.log(`Writing to: ${yamlFilePath}`);
  const yamlContent = yaml.stringify(evalCases);
  fs.writeFileSync(yamlFilePath, yamlContent, "utf8");
  console.log("YAML file written successfully");
}

// Checks if the script is being run directly (not imported as a module) and handles command-line arguments.
if (require.main === module) {
  const args = process.argv.slice(2);
  const [csvFilePath, yamlFileName, transformationType] = args;
  const availableTransformationTypes = Object.keys(transformationMap);
  if (
    args.length < 2 ||
    (transformationType &&
      !availableTransformationTypes.includes(transformationType))
  ) {
    console.error(
      "Usage: node generateEvalCasesYamlFromCSV.js <csvFileName> <yamlFileName> [transformationType]\n" +
        "Arguments:\n" +
        "  csvFileName: Input CSV file name (required)\n" +
        "  yamlFileName: Output YAML file name (required)\n" +
        `  transformationType: Type of transformßation to apply (optional, one of: ${availableTransformationTypes.join(
          ", "
        )})\n` +
        "\nReceived args:",
      args
    );
    process.exit(1);
  }
  main({
    csvFilePath,
    yamlFileName,
    transformationType,
  }).catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}
