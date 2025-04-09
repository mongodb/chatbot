import path from "path";
import fs from "fs";
import { z } from "zod";
import {
  convertBraintrustDatabaseNlQueryDatasetEntryToFlat,
  DatabaseNlQueryDatasetEntryBraintrust,
} from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";
import { countAndLogUsage } from "../treeGeneration/databaseNlQueries/analyzeDataset";

const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

const TextToMongoshEvalResult = z.object({
  input: z.object({
    databaseName: z.string(),
    nlQuery: z.string(),
  }),
  scores: z.object({
    CorrectOutputFuzzy: z.number().nullable(),
    ReasonableOutput: z.number().nullable(),
    SuccessfulExecution: z.number().nullable(),
  }),
  tags: z.array(z.string()).optional(),
  metadata: z
    .object({
      complexity: z.string(),
      generationUuid: z.string().optional(),
      language: z.string().optional(),
      methods: z.array(z.string()).optional(),
      queryOperators: z.array(z.string()).optional(),
    })
    .nullable(),
  expected: z.object({
    dbQuery: z.string(),
    result: z.any(),
    executionTimeMs: z.number().nullable().optional(),
  }),
});

type TextToMongoshEvalResult = z.infer<typeof TextToMongoshEvalResult>;

type AggregateEvals = Record<
  string,
  Omit<TextToMongoshEvalResult, "scores"> & {
    aggregateScores: Record<string, TextToMongoshEvalResult["scores"]>;
  }
>;

async function main() {
  // load all files in dataOutDir /textToMongoshBenchmarkResults
  // filter these to only include .json files
  const files = fs.readdirSync(
    path.join(dataOutDir, "textToMongoshBenchmarkResults")
  );
  const jsonFiles = files.filter((file) => file.endsWith(".json"));
  const results: AggregateEvals = {};
  for (const file of jsonFiles) {
    const filePath = path.join(
      dataOutDir,
      "textToMongoshBenchmarkResults",
      file
    );
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const evals = TextToMongoshEvalResult.array().parse(
      JSON.parse(fileContent)
    );
    for (const evaluation of evals) {
      const key = `${evaluation.input.databaseName}_${evaluation.input.nlQuery}`;
      const { scores, ...evalCase } = evaluation;
      if (!results[key]) {
        results[key] = {
          ...evalCase,
          aggregateScores: {
            file: scores,
          },
        };
      }
      results[key].aggregateScores = {
        ...results[key].aggregateScores,
        [file]: scores,
      };
    }
  }
  // filter all results to only include results where more than one score for CorrectOutputFuzzy, ReasonableOutput, SuccessfulExecution are each 1
  const filteredResults: AggregateEvals = {};

  for (const key of Object.keys(results)) {
    const result = results[key];
    const aggregateScores = result.aggregateScores;

    // Count how many models got a score of 1 for each metric
    const correctOutputCount = Object.values(aggregateScores).filter(
      (scores) => scores?.CorrectOutputFuzzy === 1
    ).length;

    const reasonableOutputCount = Object.values(aggregateScores).filter(
      (scores) => scores?.ReasonableOutput === 1
    ).length;

    const successfulExecutionCount = Object.values(aggregateScores).filter(
      (scores) => scores?.SuccessfulExecution === 1
    ).length;

    // Only include results where at least 2 models got a score of 1 for each metric
    if (
      correctOutputCount >= 2 &&
      reasonableOutputCount >= 2 &&
      successfulExecutionCount >= 2
    ) {
      filteredResults[key] = result;
    }
  }

  console.log(
    `Filtered from ${Object.keys(results).length} to ${
      Object.keys(filteredResults).length
    } results`
  );

  // Next count the distribution, i.e how many are 2 correct, 3 correct, 4 correct, etc
  const distributionOfFuzzyCorrect: Record<number, number> = {};
  for (const key of Object.keys(filteredResults)) {
    const result = filteredResults[key];
    const aggregateScores = result.aggregateScores;
    const correctOutputCount = Object.values(aggregateScores).filter(
      (scores) => scores?.CorrectOutputFuzzy === 1
    ).length;
    if (!distributionOfFuzzyCorrect[correctOutputCount]) {
      distributionOfFuzzyCorrect[correctOutputCount] = 0;
    }
    distributionOfFuzzyCorrect[correctOutputCount]++;
  }

  console.log("Distribution of FuzzyCorrect:", distributionOfFuzzyCorrect);

  // Next Count the distribution of complexities
  const distributionOfComplexity: Record<string, number> = {};
  for (const key of Object.keys(filteredResults)) {
    const result = filteredResults[key];
    const complexity = result.metadata?.complexity;
    if (complexity) {
      if (!distributionOfComplexity[complexity]) {
        distributionOfComplexity[complexity] = 0;
      }
      distributionOfComplexity[complexity]++;
    }
  }

  console.log("Distribution of Complexity:", distributionOfComplexity);

  const distributionOfDatabaseName: Record<string, number> = {};
  for (const key of Object.keys(filteredResults)) {
    const result = filteredResults[key];
    const databaseName = result.input.databaseName;
    if (!distributionOfDatabaseName[databaseName]) {
      distributionOfDatabaseName[databaseName] = 0;
    }
    distributionOfDatabaseName[databaseName]++;
  }
  console.log("Distribution of databaseName:", distributionOfDatabaseName);

  // for the database sample guides, count how many of each complexity
  const distributionOfSampleGuides: Record<string, number> = {};
  for (const key of Object.keys(filteredResults).filter(
    (key) => filteredResults[key].input.databaseName === "sample_guides"
  )) {
    const result = filteredResults[key];
    const complexity = result.metadata?.complexity;
    if (complexity) {
      if (!distributionOfSampleGuides[complexity]) {
        distributionOfSampleGuides[complexity] = 0;
      }
      distributionOfSampleGuides[complexity]++;
    }
  }
  console.log("Distribution of Sample Guides:", distributionOfSampleGuides);

  function isSimpleSampleGuide(result: AggregateEvals[string]) {
    return (
      result.metadata?.complexity === "simple" &&
      result.input.databaseName === "sample_guides"
    );
  }
  // filter out a random set of 110 from sample guides where complexity is simple
  if (distributionOfSampleGuides.simple > 110) {
    // Get all simple examples
    const simpleExamples = Object.entries(filteredResults)
      .filter(([_, result]) => isSimpleSampleGuide(result))
      .map(([key, result]) => ({ key, result }));

    // Shuffle the array of simple examples
    for (let i = simpleExamples.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [simpleExamples[i], simpleExamples[j]] = [
        simpleExamples[j],
        simpleExamples[i],
      ];
    }

    // Keep only 100 simple examples
    const simpleExamplesToKeep = simpleExamples.slice(0, 100);

    // Create a new filtered results object with all non-simple examples plus the 100 selected simple examples
    const finalFilteredResults: AggregateEvals = {};

    // Add all non-simple sample_guides examples
    Object.entries(filteredResults).forEach(([key, result]) => {
      if (!isSimpleSampleGuide(result)) {
        finalFilteredResults[key] = result;
      }
    });

    // Add the 100 selected simple examples
    simpleExamplesToKeep.forEach(({ key, result }) => {
      finalFilteredResults[key] = result;
    });

    // Log the new distribution
    const newDistribution: Record<string, number> = {};
    Object.values(finalFilteredResults).forEach((result) => {
      const complexity = result.metadata?.complexity;
      if (complexity) {
        if (!newDistribution[complexity]) {
          newDistribution[complexity] = 0;
        }
        newDistribution[complexity]++;
      }
    });

    console.log(
      "New Distribution after removing sample guides simple examples to 100:",
      newDistribution
    );

    const distributionOfFuzzyCorrect: Record<number, number> = {};
    for (const key of Object.keys(finalFilteredResults)) {
      const result = finalFilteredResults[key];
      const aggregateScores = result.aggregateScores;
      const correctOutputCount = Object.values(aggregateScores).filter(
        (scores) => scores?.CorrectOutputFuzzy === 1
      ).length;
      if (!distributionOfFuzzyCorrect[correctOutputCount]) {
        distributionOfFuzzyCorrect[correctOutputCount] = 0;
      }
      distributionOfFuzzyCorrect[correctOutputCount]++;
    }
    console.log(
      "New Distribution of FuzzyCorrect:",
      distributionOfFuzzyCorrect
    );

    return writeResultsAndCalculatePerformance(
      finalFilteredResults,
      jsonFiles,
      dataOutDir
    );
  }

  return writeResultsAndCalculatePerformance(
    filteredResults,
    jsonFiles,
    dataOutDir
  );
}

function writeResultsAndCalculatePerformance(
  results: AggregateEvals,
  jsonFiles: string[],
  dataOutDir: string
) {
  // Of the fuzzy correct set, determine how many are correct for each fileName
  const correctCountByFile: Record<string, { correct: number; total: number }> =
    {};

  // Initialize the counters for each file
  jsonFiles.forEach((file) => {
    correctCountByFile[file] = { correct: 0, total: 0 };
  });

  // Count correct examples for each file
  for (const key of Object.keys(results)) {
    const result = results[key];
    const aggregateScores = result.aggregateScores;

    Object.entries(aggregateScores).forEach(([fileName, scores]) => {
      if (fileName !== "file" && scores) {
        correctCountByFile[fileName].total++;
        if (scores.CorrectOutputFuzzy === 1) {
          correctCountByFile[fileName].correct++;
        }
      }
    });
  }

  // Calculate and display percentages
  const filePerformance: Record<
    string,
    { correct: number; total: number; percentage: number }
  > = {};

  Object.entries(correctCountByFile).forEach(([fileName, counts]) => {
    const percentage =
      counts.total > 0 ? (counts.correct / counts.total) * 100 : 0;
    filePerformance[fileName] = {
      ...counts,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
    };
  });

  console.log("Performance by file:", filePerformance);

  const filteredResults = Object.values(results)
    .filter((res) => res.metadata)
    .map((res) => {
      const braintrustNlQuery: DatabaseNlQueryDatasetEntryBraintrust = {
        input: res.input,
        expected:
          res.expected as DatabaseNlQueryDatasetEntryBraintrust["expected"],
        tags: res.tags ?? [],
        metadata: (res.metadata ??
          {}) as DatabaseNlQueryDatasetEntryBraintrust["metadata"],
      };
      return convertBraintrustDatabaseNlQueryDatasetEntryToFlat(
        braintrustNlQuery
      );
    });
  countAndLogUsage(filteredResults);
  // Write filtered results to a file
  fs.writeFileSync(
    path.join(dataOutDir, "filteredTextToMongoshBenchmarkResults.json"),
    JSON.stringify(filteredResults, null, 2)
  );

  return results;
}

main();
