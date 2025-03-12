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
  {
    model: "GPT-4o",
    experimentName: "gpt-4o-badge-631d3a9b",
  },
  {
    model: "Claude 3.5 Sonnet v2",
    experimentName: "claude-35-sonnet-v2-badge-cb743d9f",
  },
  {
    model: "Claude 3.5 Sonnet",
    experimentName: "claude-35-sonnet-badge-f3427e16",
  },
  { model: "Gemini 2 Flash", experimentName: "gemini-2-flash-badge-76fea4f5" },
  {
    model: "Claude 3.5 Haiku",
    experimentName: "claude-35-haiku-badge-4f4d32bb",
  },
  { model: "Nova Pro v1", experimentName: "nova-pro-v1:0-badge-e76a0833" },
  { model: "Llama 3.1 70B", experimentName: "llama-3.1-70b-badge-f2e28e86" },
  { model: "Llama 3.2 90B", experimentName: "llama-3.2-90b-badge-81111f12" },
  {
    model: "Claude 3.5 Haiku",
    experimentName: "claude-35-haiku-badge-4f4d32bb",
  },
  {
    model: "Gemini 1.5 Flash",
    experimentName: "gemini-1.5-flash-002-badge-e0141bec",
  },
  { model: "Nova Lite v1", experimentName: "nova-lite-v1:0-badge-c896c5f3" },
  { model: "Llama 3 70B", experimentName: "llama-3-70b-badge-54545f72" },
  { model: "GPT-4o Mini", experimentName: "gpt-4o-mini-badge" },
  {
    model: "Gemini 1.5 Pro",
    experimentName: "gemini-1.5-pro-002-badge-fc8268f2",
  },
  {
    model: "GPT-35 Turbo 16k",
    experimentName: "gpt-35-turbo-16k-badge-6282561d",
  },
  {
    model: "Gemini 1.0 Pro",
    experimentName: "gemini-1.0-pro-002-badge-62c646b1",
  },
  { model: "Nova Micro v1", experimentName: "nova-micro-v1:0-badge-e415a9d7" },
  {
    model: "Mistral Large 2",
    experimentName: "mistral-large-2-badge-2526d48b",
  },
  {
    model: "Claude 3 Sonnet",
    experimentName: "claude-3-sonnet-badge-a8791d43",
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
  const outputDir = path.join(basePathOut, "csv", "badge");
  ensureOutputDirectory(outputDir);

  const titleTags = [
    "Relational to Document Model",
    "Schema Patterns and Antipatterns",
    "Schema Design Optimization",
    "Advanced Schema Patterns and Antipatterns",
  ] as const;

  // Define a type for the quiz titles
  type QuizTitle = (typeof titleTags)[number];

  // Use Record to create a type with the specific keys
  type ExperimentAggregate = {
    model: string;
    "Total % Correct": number;
  } & Partial<Record<QuizTitle, number>>;

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

    // Add the quiz name as a tag if metadata.title is defined
    // Note: in the future we should do better tagging in advance to avoid hacks like this.
    const resultsWithQuizNameTag = results.map((result) => {
      // Only add metadata.title as a tag if it's defined
      const additionalTags = result.metadata?.title
        ? [result.metadata.title]
        : [];

      return {
        ...result,
        tags: [...(result.tags || []), ...additionalTags],
      } satisfies ExperimentResult<
        QuizQuestionEvalCase,
        QuizQuestionTaskOutput,
        ["CorrectQuizAnswer"]
      >;
    });

    const tagAggregates = aggregateScoresByTag(resultsWithQuizNameTag, [
      "CorrectQuizAnswer",
    ]);
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

    const experimentAggregate: Partial<ExperimentAggregate> = {
      model,
      "Total % Correct": aggregateExperimentScoreMean(
        resultsWithQuizNameTag,
        "CorrectQuizAnswer"
      )?.mean as number,
    };
    const tagAggEntries = Array.from(tagAggregates.entries());
    // Convert the Map entries to an array that we can iterate over
    tagAggEntries.forEach(([tag, stats]) => {
      // Type guard function to check if a string is a valid QuizTitle
      function isQuizTitle(value: string): value is QuizTitle {
        return titleTags.includes(value as any);
      }

      if (isQuizTitle(tag)) {
        experimentAggregate[tag] = stats.CorrectQuizAnswer.mean;
      }
    });
    experimentAggregates.push(experimentAggregate as ExperimentAggregate);
  }

  // Write experiment aggregates to CSV
  await writeDataToCsv(
    experimentAggregates,
    createCsvHeaders(experimentAggregates),
    path.join(outputDir, "badge_quiz_question_experiment_aggregates.csv")
  );
}

main().catch(console.error);
