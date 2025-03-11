import { BRAINTRUST_ENV_VARS } from "../envVars";
import { assertEnvVars } from "mongodb-rag-core";
import { EvalCase } from "mongodb-rag-core/braintrust";
import {
  //   aggregateScoresByTagForBraintrustExperiment,
  ExperimentResults,
  getBraintrustExperimentResults,
} from "../reporting/getBraintrustExperimentResults";
import path from "path";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import { aggregateScoresByTag } from "../reporting/aggregateScoresByTag";
import { convertTagStatsToFlatObject } from "../reporting/convertTagStatsToFlatObject";

const { BRAINTRUST_API_KEY } = assertEnvVars(BRAINTRUST_ENV_VARS);
const projectName = "mongodb-multiple-choice";
const experiments = [
  "gpt-4o-badge-631d3a9b",
  "claude-35-sonnet-v2-badge-cb743d9f",
  "claude-35-sonnet-badge-f3427e16",
  "gemini-2-flash-badge-76fea4f5",
  "claude-35-haiku-badge-4f4d32bb",
  "nova-pro-v1:0-badge-e76a0833",
  "llama-3.1-70b-badge-f2e28e86",
  "llama-3.2-90b-badge-81111f12",
  "claude-3-haiku-badge-8779c951",
  "gemini-1.5-flash-002-badge-e0141bec",
  "nova-lite-v1:0-badge-c896c5f3",
  "llama-3-70b-badge-54545f72",
  "gpt-4o-mini-badge",
  "gemini-1.5-pro-002-badge-fc8268f2",
  "gpt-35-turbo-16k-badge-6282561d",
  "gemini-1.0-pro-002-badge-62c646b1",
  "nova-micro-v1:0-badge-e415a9d7",
  "mistral-large-2-badge-2526d48b",
  "claude-3-sonnet-badge-a8791d43",
];

const basePathOut = path.resolve(__dirname, "..", "testData");

/**
Ensures the output directory exists.

@param dirPath The path to the directory to ensure.
*/
function ensureOutputDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
Type definition for CSV headers.
*/
type CsvHeader = { id: string; title: string };

/**
Type definition for CSV data.
*/
type CsvData = Record<string, string | number | null | undefined>;

/**
Safely converts a value to a string representation suitable for CSV.

@param value The value to convert.
@returns A string representation of the value.
*/
function safeStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return "[Complex Object]";
    }
  }

  return String(value);
}

/**
Writes data to a CSV file.

@param data The data to write to the CSV file.
@param headers The headers for the CSV file.
@param filePath The path to the CSV file.
*/
async function writeDataToCsv(
  data: CsvData[],
  headers: CsvHeader[],
  filePath: string
): Promise<void> {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await csvWriter.writeRecords(data);
  console.log(`CSV file written to ${filePath} with ${data.length} records`);
}

/**
Creates CSV headers from data.

@param data The data to create headers from.
@returns The created headers.
*/
function createCsvHeaders(data: CsvData[]): CsvHeader[] {
  if (data.length === 0) return [];

  return Object.keys(data[0]).map((key) => ({
    id: key,
    title: key,
  }));
}

/**
Main function.
*/
// async function main() {
//   const outputDir = path.join(basePathOut, "csv");
//   ensureOutputDirectory(outputDir);

//   // Store all experiment results for summary
//   const allExperimentResults: CsvData[] = [];
//   const tagScores: Record<string, Record<string, number[]>> = {};
//   const experimentResultsMap: Record<
//     string,
//     ExperimentResults<EvalCase<unknown, unknown, unknown>, unknown, string[]>[]
//   > = {};

//   // Process each experiment
//   for (const experiment of experiments.slice(0, 1)) {
//     console.log(`Processing experiment: ${experiment}`);

//     // Fetch results for the experiment
//     const results = await aggregateScoresByTagForBraintrustExperiment({
//       experimentName: experiment,
//       projectName,
//       apiKey: BRAINTRUST_API_KEY,
//     });
//     console.log(results);
//     const flatResults = convertTagStatsToFlatObject(results);
//     console.log(flatResults);
//   }
// }

// main().catch(console.error);
