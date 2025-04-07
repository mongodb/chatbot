import { BRAINTRUST_ENV_VARS } from "../../envVars";
import { assertEnvVars } from "mongodb-rag-core";
import {
  ExperimentResult,
  getBraintrustExperimentResults,
} from "../../reporting/getBraintrustExperimentResults";
import path from "path";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import { aggregateScoresByTag } from "../../reporting/aggregateScoresByTag";
import { convertTagStatsToFlatObject } from "../../reporting/convertTagStatsToFlatObject";
import {
  QuizQuestionEvalCase,
  QuizQuestionTaskOutput,
} from "../QuizQuestionEval";
import { aggregateExperimentScoreMean } from "../../reporting/aggregateExperimentScoreMean";

const { BRAINTRUST_API_KEY } = assertEnvVars(BRAINTRUST_ENV_VARS);
const projectName = "mongodb-multiple-choice";
const experiments = [
  { experimentName: "mistral-large-2", model: "Mistral Large 2" },
  { experimentName: "gemini-2-flash", model: "Gemini 2 Flash" },
  { experimentName: "claude-35-sonnet-v2", model: "Claude 3.5 Sonnet v2" },
  { experimentName: "llama-3.1-70b", model: "Llama 3.1 70B" },
  { experimentName: "nova-pro-v1:0", model: "Nova Pro v1" },
  { experimentName: "gpt-4o", model: "GPT-4o" },
];

const basePathOut = path.resolve(__dirname, "..", "..", "..", "testData");

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
  Writes data to a CSV file.
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

async function main() {
  const outputDir = path.join(basePathOut, "csv", "allQuiz");
  ensureOutputDirectory(outputDir);

  type ExperimentAggregate = {
    model: string;
    "All Questions (% correct)": number;
    "All Questions (count)": number;
    [key: string]: string | number;
  };

  const experimentAggregates: ExperimentAggregate[] = [];

  // Process each experiment
  for (const { experimentName, model } of experiments) {
    console.log(`Processing experiment: ${experimentName}`);

    // Fetch results for the experiment
    const results = await getBraintrustExperimentResults<
      QuizQuestionEvalCase,
      QuizQuestionTaskOutput,
      ["CorrectQuizAnswer"]
    >({
      experimentName: experimentName,
      projectName,
      apiKey: BRAINTRUST_API_KEY,
    });

    const tagAggregates = aggregateScoresByTag(results, ["CorrectQuizAnswer"]);
    const flatResults = convertTagStatsToFlatObject(tagAggregates);

    const csvEntries = Object.entries(flatResults).map(([key, value]) => ({
      tag: key,
      ...value,
    }));
    await writeDataToCsv(
      csvEntries,
      createCsvHeaders(csvEntries),
      path.join(outputDir, `${experimentName}_aggregates.csv`)
    );

    const experimentAggregate: ExperimentAggregate = {
      model,
      "All Questions (% correct)": aggregateExperimentScoreMean(
        results,
        "CorrectQuizAnswer"
      )?.mean as number,
      "All Questions (count)": results.length,
    };
    const tagAggEntries = Array.from(tagAggregates.entries());
    // Convert the Map entries to an array that we can iterate over
    tagAggEntries.forEach(([tag, stats]) => {
      experimentAggregate[`${tag} (% correct)`] = stats.CorrectQuizAnswer.mean;
      experimentAggregate[`${tag} (count)`] = stats.CorrectQuizAnswer.count;
    });
    experimentAggregates.push(experimentAggregate);
  }

  // Write experiment aggregates to CSV
  await writeDataToCsv(
    experimentAggregates,
    createCsvHeaders(experimentAggregates),
    path.join(outputDir, "all_quiz_question_experiment_aggregates.csv")
  );
}

main().catch(console.error);
