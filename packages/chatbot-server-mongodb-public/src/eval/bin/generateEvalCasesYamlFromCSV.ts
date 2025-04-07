/**
 # Generate Evaluation Cases YAML from CSV
 
 This script converts conversation evaluation cases from a CSV file to YAML format.
 It supports optional transformations of the evaluation cases during conversion.
 It also checks for missing resources in the database and logs them to the console.
 
 ## Usage
 
 Can be run through npm script or directly using node:
 
 ```bash
 npm run generate-eval-cases -- <csvFileName> <yamlFileName> [transformationType] [transformationOptions]
 ```
 
 Or:
 
 ```bash
 node generateEvalCasesYamlFromCSV.js <csvFileName> <yamlFileName> [transformationType] [transformationOptions]
 ```
 
 ### Arguments
 
 - `csvFilePath`: (Required) Absolute path to the input CSV file
 - `yamlFileName`: (Required) Name of the output YAML file (without .yml extension)
 - `transformationType`: (Optional) Type of transformation to apply to the cases
 - `transformationOptions`: (Optional) Additional options for the transformation
 
 ### Available Transformations
 
 - `addTags`: Adds specified tags to all evaluation cases
 - `addCustomTags`: Adds specified custom tags to all evaluation cases
 
 ### File Paths
 
 - Output YAML files will be generated in: `evalCases/`
 
 ### Example
 
 ```bash
 npm run generate-eval-cases -- /path/to/input.csv output-name addTags tag1 tag2
 ```
 
 This will:
 1. Read from: /path/to/input.csv
 2. Add tags "tag1" and "tag2" to all cases, after validating them against the MongoDbTags enum.
 3. Write to: evalCases/output-name.yml
 4. Log any missing resources to the console as warnings
*/

import fs from "fs";
import path from "path";
import yaml from "yaml";
import {
  getConversationEvalCasesFromCSV,
  ConversationEvalCase,
} from "mongodb-rag-core/eval";
import { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } from "../../config";
import { makeMongoDbPageStore } from "mongodb-rag-core";
import { validateTags } from "mongodb-rag-core";

const SRC_ROOT = path.resolve(__dirname, "../");

const pageStore = makeMongoDbPageStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

function addTags({
  evalCases,
  tagNames,
  custom = false,
}: {
  evalCases: ConversationEvalCase[];
  tagNames: string[];
  custom?: boolean;
}): ConversationEvalCase[] {
  validateTags(tagNames, custom);
  return evalCases.map((caseItem) => ({
    ...caseItem,
    tags: [...(caseItem.tags || []), ...tagNames],
  }));
}

const transformationMap: Record<
  string,
  (cases: ConversationEvalCase[], options?: string[]) => ConversationEvalCase[]
> = {
  addTags: (cases: ConversationEvalCase[], options?: string[]) =>
    addTags({ evalCases: cases, tagNames: options || [] }),
  addCustomTags: (cases: ConversationEvalCase[], options?: string[]) =>
    addTags({ evalCases: cases, tagNames: options || [], custom: true }),
  // Add more transformation functions here as needed
};

/**
 Normalizes a URL by removing the protocol (http/https) and 'www.' prefix
 normalizeUrl('https://www.example.com') // returns 'example.com'
 normalizeUrl('http://example.com') // returns 'example.com'
 */
function normalizeUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/i, "");
}

const findMissingResources = async (
  expectedUrls: string[]
): Promise<string[]> => {
  const results = await Promise.all(
    expectedUrls.map(async (url) => {
      const page = await pageStore.loadPage({
        query: { url: { $regex: new RegExp(normalizeUrl(url)) } },
      });
      return !page ? url : null;
    })
  );
  return results.filter((url) => url !== null) as string[];
};

/**
 Main function to read CSV file, transform evaluation cases, and write to YAML file.
 @param csvFilePath - Path to the input CSV file
 @param yamlFileName - Name of the output YAML file
 @param transformationType - Type of transformation to apply (optional)
 */
async function main({
  csvFilePath,
  yamlFileName,
  transformationType,
  transformationOptions,
}: {
  csvFilePath: string;
  yamlFileName: string;
  transformationType?: keyof typeof transformationMap;
  transformationOptions?: string[];
}): Promise<void> {
  console.log(`Reading from: ${csvFilePath}`);
  const evalCases = await getConversationEvalCasesFromCSV(
    csvFilePath,
    transformationType
      ? (cases) =>
          transformationMap[transformationType](cases, transformationOptions)
      : undefined
  );
  const expectedUrls = Array.from(
    new Set(evalCases.flatMap((caseItem) => caseItem.expectedLinks ?? []))
  );
  const urlsNotIngested = await findMissingResources(expectedUrls);
  if (urlsNotIngested.length > 0) {
    console.warn(
      `Warning: ${urlsNotIngested.length}/${
        expectedUrls.length
      } URLs are expected to be referenced by the chatbot, but have not been ingested:\n${urlsNotIngested
        .map((url) => `  - ${url}`)
        .join("\n")}`
    );
  }
  const yamlFilePath = path.join(
    SRC_ROOT,
    `../../evalCases/${yamlFileName}.yml`
  );
  console.log(`Writing to: ${yamlFilePath}`);
  const yamlContent = yaml.stringify(evalCases);
  await fs.promises.writeFile(yamlFilePath, yamlContent, "utf8");
  console.log("YAML file written successfully");
}

// Checks if the script is being run directly (not imported as a module) and handles command-line arguments.
if (require.main === module) {
  const args = process.argv.slice(2);
  const [
    csvFilePath,
    yamlFileName,
    transformationType,
    ...transformationOptions
  ] = args;
  const availableTransformationTypes = Object.keys(transformationMap);
  if (
    args.length < 2 ||
    (transformationType &&
      !availableTransformationTypes.includes(transformationType))
  ) {
    console.error(
      "Usage: node generateEvalCasesYamlFromCSV.js <csvFileName> <yamlFileName> [transformationType] [tranformationOptions]\n" +
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
    transformationOptions,
  })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    })
    .finally(() => {
      pageStore.close();
    });
}
