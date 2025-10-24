import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { getBraintrustExperimentResults } from "../../reporting/getBraintrustExperimentResults";
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
  {
    model: "GPT 5",
    experimentName: "multiple_choice?experimentType=answer_question&model=gpt-5&datasets=mdbu_quiz_all-ad20cb9f",
  },
  {
    model: "GPT 5 Mini",
    experimentName: "multiple_choice?experimentType=answer_question&model=gpt-5-mini&datasets=mdbu_quiz_all-ab823151",
  },
  {
    model: "GPT 4o",
    experimentName: "multiple_choice?experimentType=answer_question&model=gpt-4o&datasets=mdbu_quiz_all-80e9b77e",
  },
  {
    model: "GPT 4o Mini",
    experimentName: "multiple_choice?experimentType=answer_question&model=gpt-4o-mini&datasets=mdbu_quiz_all",
  },
  {
    model: "Gemini 2.5 Pro",
    experimentName: "multiple_choice?experimentType=answer_question&model=gemini-2.5-pro&datasets=mdbu_quiz_all",
  },
  {
    model: "Gemini 2.5 Flash",
    experimentName: "multiple_choice?experimentType=answer_question&model=gemini-2.5-flash&datasets=mdbu_quiz_all",
  },
  {
    model: "Claude 4.1 Opus",
    experimentName: "multiple_choice?experimentType=answer_question&model=claude-opus-4.1&datasets=mdbu_quiz_all",
  },
  {
    model: "Claude 4 Sonnet",
    experimentName: "multiple_choice?experimentType=answer_question&model=claude-sonnet-4&datasets=mdbu_quiz_all",
  },
  {
    model: "Claude 3.7 Sonnet",
    experimentName: "multiple_choice?experimentType=answer_question&model=claude-37-sonnet&datasets=mdbu_quiz_all",
  },
  {
    model: "Mistral Large 2",
    experimentName: "multiple_choice?experimentType=answer_question&model=mistral-large-2&datasets=mdbu_quiz_all",
  },
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
