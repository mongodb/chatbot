/**
 Creates "fuzzy" variations of prompts to simulate real user language,
 then evaluates them using the standard evaluation flow.
 
 Given N ideal prompts, generates M variations per prompt at varying quality levels,
 then runs all N*M variations through the evaluation pipeline.
 */

import path from "path";
import os from "os";
import fs from "fs";
import { getEnv } from "mongodb-rag-core";
import { createOpenAI, generateText } from "mongodb-rag-core/aiSdk";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { getModel, mercuryStarredModelConfigs } from "./models";
import { makeMercuryDatabase, MercuryPrompt } from "./database";
import {
  evaluatePromptModelPairs,
  createEvaluationConfig,
  EvaluationTask,
} from "./evaluationCore";
import { OpenAI } from "mongodb-rag-core/openai";

// 🔧 CONFIGURATION: Edit these prompt IDs to select specific prompts
// Leave empty array to use random prompts
const SPECIFIC_PROMPT_IDS: string[] = [
  // Example: "507f1f77bcf86cd799439011",
  // Add your prompt IDs here, or leave empty for random selection
];

const NUM_PROMPTS = 4; // Number of base prompts to use
const NUM_VARIATIONS_PER_PROMPT = 10; // Number of variations to generate per prompt

/**
 Maps a numeric score to a label based on thresholds
 */
function mapArbitraryScoreToLabel(score: number | null) {
  if (score === null) {
    return undefined;
  }
  if (score < 0.4) {
    return "Mismatch";
  }
  if (score < 0.5) {
    return "Subset";
  }
  if (score < 0.8) {
    return "Superset";
  }
  return "Match";
}

interface PromptVariation {
  original: MercuryPrompt;
  variation: {
    content: string;
    qualityLevel: string;
    description: string;
  };
}

interface EvaluationSummary {
  averageScore: number;
  averageLabel: string | undefined;
  modalLabel: string | undefined;
  totalEvaluations: number;
  labelDistribution: Record<string, number>;
}

interface FuzzyPromptResult {
  originalPrompt: {
    id: string;
    name: string;
    content: string;
    expected: string;
  };
  variation: {
    content: string;
    qualityLevel: string;
    description: string;
  };
  evaluationResults: Array<{
    model: string;
    developer: string;
    response: string;
    score: number;
    rationale?: string;
    label?: string;
  }>;
}

interface PromptComparisonResult {
  promptId: string;
  promptName: string;
  promptContent: string;
  fuzzyVariations: FuzzyPromptResult[];
  fuzzySummary: EvaluationSummary;
  baselineSummary: EvaluationSummary | null;
}

const env = getEnv({
  required: [
    "MERCURY_CONNECTION_URI",
    "BRAINTRUST_PROXY_ENDPOINT",
    "BRAINTRUST_API_KEY",
  ],
  optional: {
    MERCURY_DATABASE_NAME: "docs-chatbot-dev",
    MERCURY_PROMPTS_COLLECTION: "llm_cases",
    MERCURY_RESULTS_COLLECTION: "llm_results_new",
  },
});

/**
 Calculates summary statistics for a set of evaluation results
 */
function calculateEvaluationSummary(
  results: Array<{ score: number; label?: string }>
): EvaluationSummary {
  if (results.length === 0) {
    return {
      averageScore: 0,
      averageLabel: undefined,
      modalLabel: undefined,
      totalEvaluations: 0,
      labelDistribution: {},
    };
  }

  // Calculate average score
  const averageScore =
    results.reduce((sum, result) => sum + result.score, 0) / results.length;

  // Map average score to label
  const averageLabel = mapArbitraryScoreToLabel(averageScore);

  // Calculate label distribution and find modal label
  const labelCounts: Record<string, number> = {};
  results.forEach((result) => {
    const label = result.label || "Unknown";
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  });

  // Find the most common label (modal)
  let modalLabel: string | undefined;
  let maxCount = 0;
  Object.entries(labelCounts).forEach(([label, count]) => {
    if (count > maxCount) {
      maxCount = count;
      modalLabel = label;
    }
  });

  return {
    averageScore,
    averageLabel,
    modalLabel,
    totalEvaluations: results.length,
    labelDistribution: labelCounts,
  };
}

const generatorModelConfig = getModel("gpt-4.1");

/**
 Generates variations of a prompt using GPT-4.1 at different quality levels
 */
async function generatePromptVariations(
  originalPrompt: MercuryPrompt,
  numVariations: number
): Promise<PromptVariation[]> {
  const client = createOpenAI({
    baseURL: env.BRAINTRUST_PROXY_ENDPOINT,
    apiKey: env.BRAINTRUST_API_KEY,
  });

  const systemPrompt = `You are helping create realistic variations of chatbot prompts to test how well AI systems handle different quality levels of user input.

Given an original prompt, create ${numVariations} variations that ask the same fundamental question but with different quality levels:

Quality Levels to distribute across the variations:
- High Quality (2-3 variations): Well-formed, clear, professional language
- Medium Quality (3-4 variations): Casual but understandable, some informal language  
- Low Quality (2-3 variations): Unclear, rambling, or missing context
- Poor Quality (1-2 variations): Contains typos, grammar errors, or very unclear wording

For each variation, provide:
1. The rewritten prompt
2. The quality level (high/medium/low/poor)
3. A brief description of what makes it that quality level

Return your response as a JSON array with this structure:
[
  {
    "content": "rewritten prompt text",
    "qualityLevel": "high|medium|low|poor", 
    "description": "explanation of quality characteristics"
  }
]

Make sure the variations still ask fundamentally the same question as the original, just with different language quality.`;

  const originalContent = Array.isArray(originalPrompt.prompt)
    ? originalPrompt.prompt.map((msg) => msg.content).join("\n")
    : originalPrompt.prompt;

  console.log(
    `Generating ${numVariations} variations for: "${originalPrompt.name}"`
  );

  try {
    const response = await generateText({
      model: client.chat(generatorModelConfig.deployment),
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Original prompt: "${originalContent}"

Please generate ${numVariations} variations of this prompt with different quality levels.`,
        },
      ],
    });

    const variations = JSON.parse(response.text);

    return variations.map((variation: any) => ({
      original: originalPrompt,
      variation: {
        content: variation.content,
        qualityLevel: variation.qualityLevel,
        description: variation.description,
      },
    }));
  } catch (error) {
    console.error(
      `Failed to generate variations for prompt ${originalPrompt._id}:`,
      error
    );
    return [];
  }
}

/**
 Fetches prompts from the database
 */
async function fetchPrompts(db: any): Promise<MercuryPrompt[]> {
  if (SPECIFIC_PROMPT_IDS.length > 0) {
    console.log(
      `Fetching ${SPECIFIC_PROMPT_IDS.length} specific prompts by ID...`
    );
    const objectIds = SPECIFIC_PROMPT_IDS.map((id) => new ObjectId(id));
    return await db.promptsCollection
      .find({ _id: { $in: objectIds } })
      .toArray();
  } else {
    console.log(`Fetching ${NUM_PROMPTS} random prompts...`);
    return await db.promptsCollection
      .aggregate([{ $sample: { size: NUM_PROMPTS } }])
      .toArray();
  }
}

/**
 Fetches baseline evaluation results from the database for the given prompts
 */
async function fetchBaselineResults(
  db: any,
  prompts: MercuryPrompt[]
): Promise<Record<string, Array<{ score: number; label?: string }>>> {
  const promptIds = prompts.map((p) => p._id);

  console.log(`Fetching baseline results for ${promptIds.length} prompts...`);

  const baselineResults = await db.client
    .db(env.MERCURY_DATABASE_NAME)
    .collection(env.MERCURY_RESULTS_COLLECTION)
    .find({
      promptId: { $in: promptIds },
      "metrics.referenceAlignment": { $exists: true },
    })
    .toArray();

  console.log(`Found ${baselineResults.length} baseline evaluation results`);

  // Group results by prompt ID
  const resultsByPrompt: Record<
    string,
    Array<{ score: number; label?: string }>
  > = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baselineResults.forEach((result: any) => {
    const promptId = result.promptId.toString();
    if (!resultsByPrompt[promptId]) {
      resultsByPrompt[promptId] = [];
    }

    const referenceAlignment = result.metrics?.referenceAlignment;
    if (referenceAlignment) {
      resultsByPrompt[promptId].push({
        score: referenceAlignment.score ?? 0,
        label: referenceAlignment.label,
      });
    }
  });

  return resultsByPrompt;
}

/**
 Creates evaluation tasks from prompt variations
 */
function createEvaluationTasks(
  variations: PromptVariation[]
): EvaluationTask[] {
  const tasks: EvaluationTask[] = [];

  for (const variation of variations) {
    for (const model of mercuryStarredModelConfigs) {
      // Create a new prompt object with the variation content
      const variationPrompt: MercuryPrompt = {
        ...variation.original,
        _id: new ObjectId(), // New ID for the variation
        name: `${variation.original.name} (${variation.variation.qualityLevel})`,
        prompt: [{ role: "user", content: variation.variation.content }],
        // Keep the same expected response as the original
      };

      tasks.push({
        prompt: variationPrompt,
        model,
      });
    }
  }

  return tasks;
}

/**
 Processes evaluation results into the final comparison format
 */
function processResults(
  variations: PromptVariation[],
  evaluationResults: any[],
  baselineResults: Record<string, Array<{ score: number; label?: string }>>
): PromptComparisonResult[] {
  // Group variations by original prompt
  const variationsByPrompt: Record<string, PromptVariation[]> = {};
  variations.forEach((variation) => {
    const promptId = variation.original._id.toString();
    if (!variationsByPrompt[promptId]) {
      variationsByPrompt[promptId] = [];
    }
    variationsByPrompt[promptId].push(variation);
  });

  const results: PromptComparisonResult[] = [];

  for (const [promptId, promptVariations] of Object.entries(
    variationsByPrompt
  )) {
    const originalPrompt = promptVariations[0].original;

    // Process fuzzy variations for this prompt
    const fuzzyVariations: FuzzyPromptResult[] = [];
    const allFuzzyEvaluations: Array<{ score: number; label?: string }> = [];

    for (const variation of promptVariations) {
      // Find all evaluation results for this variation
      const variationResults = evaluationResults.filter(
        (result) =>
          result.prompt.includes(`(${variation.variation.qualityLevel})`) &&
          result.promptId.toString() === promptId
      );

      const fuzzyResult: FuzzyPromptResult = {
        originalPrompt: {
          id: variation.original._id.toString(),
          name: variation.original.name,
          content: Array.isArray(variation.original.prompt)
            ? variation.original.prompt.map((msg) => msg.content).join("\n")
            : variation.original.prompt,
          expected: variation.original.expected,
        },
        variation: variation.variation,
        evaluationResults: variationResults.map((result) => ({
          model: result.model,
          developer: result.developer,
          response: result.response,
          score: result.metrics.referenceAlignment.score,
          rationale: result.metrics.referenceAlignment.rationale,
          label: result.metrics.referenceAlignment.label,
        })),
      };

      fuzzyVariations.push(fuzzyResult);

      // Collect all evaluation results for summary
      variationResults.forEach((result) => {
        allFuzzyEvaluations.push({
          score: result.metrics.referenceAlignment.score,
          label: result.metrics.referenceAlignment.label,
        });
      });
    }

    // Calculate fuzzy summary
    const fuzzySummary = calculateEvaluationSummary(allFuzzyEvaluations);

    // Calculate baseline summary if available
    const baselineEvaluations = baselineResults[promptId] || [];
    const baselineSummary =
      baselineEvaluations.length > 0
        ? calculateEvaluationSummary(baselineEvaluations)
        : null;

    const promptComparison: PromptComparisonResult = {
      promptId,
      promptName: originalPrompt.name,
      promptContent: Array.isArray(originalPrompt.prompt)
        ? originalPrompt.prompt.map((msg) => msg.content).join("\n")
        : originalPrompt.prompt,
      fuzzyVariations,
      fuzzySummary,
      baselineSummary,
    };

    results.push(promptComparison);
  }

  return results;
}

async function main() {
  console.log("🔀 Starting Fuzzy Prompt Generation and Evaluation");
  console.log(`📋 Configuration:`);
  console.log(
    `   - Base prompts: ${
      SPECIFIC_PROMPT_IDS.length > 0
        ? `${SPECIFIC_PROMPT_IDS.length} specific IDs`
        : `${NUM_PROMPTS} random`
    }`
  );
  console.log(`   - Variations per prompt: ${NUM_VARIATIONS_PER_PROMPT}`);
  console.log(
    `   - Total variations: ${
      (SPECIFIC_PROMPT_IDS.length || NUM_PROMPTS) * NUM_VARIATIONS_PER_PROMPT
    }`
  );
  console.log(`   - Models to evaluate: ${mercuryStarredModelConfigs.length}`);
  console.log(
    `   - Total evaluations: ${
      (SPECIFIC_PROMPT_IDS.length || NUM_PROMPTS) *
      NUM_VARIATIONS_PER_PROMPT *
      mercuryStarredModelConfigs.length
    }`
  );

  // Connect to database
  const db = makeMercuryDatabase({
    connectionUri: env.MERCURY_CONNECTION_URI,
    databaseName: env.MERCURY_DATABASE_NAME,
    promptsCollectionName: env.MERCURY_PROMPTS_COLLECTION,
    reportsCollectionName: "llm_reports", // Not used but required
    resultsCollectionName: "llm_results", // Not used but required
    answersCollectionName: "llm_answers", // Not used but required
  });

  try {
    await db.connect();

    // Step 1: Fetch base prompts
    console.log("\n📚 Step 1: Fetching base prompts...");
    const basePrompts = await fetchPrompts(db);
    console.log(`✅ Found ${basePrompts.length} base prompts`);

    if (basePrompts.length === 0) {
      console.error(
        "❌ No prompts found. Check your prompt IDs or database connection."
      );
      return;
    }

    // Step 1.5: Fetch baseline results for comparison
    console.log("\n📊 Step 1.5: Fetching baseline evaluation results...");
    const baselineResults = await fetchBaselineResults(db, basePrompts);
    const totalBaselineResults = Object.values(baselineResults).reduce(
      (sum, results) => sum + results.length,
      0
    );
    console.log(`✅ Found ${totalBaselineResults} baseline evaluation results`);

    Object.entries(baselineResults).forEach(([promptId, results]) => {
      const prompt = basePrompts.find((p) => p._id.toString() === promptId);
      if (prompt && results.length > 0) {
        console.log(
          `   ${prompt.name}: ${results.length} baseline evaluations`
        );
      }
    });

    // Step 2: Generate variations
    console.log("\n🎭 Step 2: Generating prompt variations...");
    const allVariations: PromptVariation[] = [];

    for (const prompt of basePrompts) {
      const variations = await generatePromptVariations(
        prompt,
        NUM_VARIATIONS_PER_PROMPT
      );
      allVariations.push(...variations);
      console.log(
        `   Generated ${variations.length} variations for "${prompt.name}"`
      );
    }

    console.log(`✅ Generated ${allVariations.length} total variations`);

    // Step 3: Create evaluation tasks
    console.log("\n🎯 Step 3: Creating evaluation tasks...");
    const evaluationTasks = createEvaluationTasks(allVariations);
    console.log(`✅ Created ${evaluationTasks.length} evaluation tasks`);

    // Step 4: Run evaluations
    console.log("\n🧪 Step 4: Running evaluations...");
    const evaluationConfig = createEvaluationConfig({
      generatorClients: {
        braintrust: createOpenAI({
          baseURL: env.BRAINTRUST_PROXY_ENDPOINT,
          apiKey: env.BRAINTRUST_API_KEY,
        }),
      },
      judgementClient: new OpenAI({
        baseURL: env.BRAINTRUST_PROXY_ENDPOINT,
        apiKey: env.BRAINTRUST_API_KEY,
      }),
      judgementModel: getModel("gpt-4.1"),
    });

    let completedEvaluations = 0;
    const { results: evaluationResults, errors } =
      await evaluatePromptModelPairs(evaluationTasks, evaluationConfig, {
        concurrency: 10,
        onProgress: (completed, total) => {
          completedEvaluations = completed;
          if (completed % 10 === 0 || completed === total) {
            console.log(
              `   Progress: ${completed}/${total} (${Math.round(
                (completed / total) * 100
              )}%)`
            );
          }
        },
      });

    console.log(`✅ Completed ${evaluationResults.length} evaluations`);
    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} evaluations failed`);
    }

    // Step 5: Process and save results
    console.log("\n💾 Step 5: Processing and saving results...");
    const finalResults = processResults(
      allVariations,
      evaluationResults,
      baselineResults
    );

    // Create output directory and save
    const outputDir = path.join(
      os.homedir(),
      "Desktop",
      "fuzzy-prompts-results"
    );
    const timestamp = Date.now();
    const outputFile = path.join(outputDir, `fuzzy-prompts-${timestamp}.json`);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(
      outputFile,
      JSON.stringify(
        {
          metadata: {
            timestamp: new Date().toISOString(),
            basePrompts: basePrompts.length,
            variationsPerPrompt: NUM_VARIATIONS_PER_PROMPT,
            totalVariations: allVariations.length,
            modelsEvaluated: mercuryStarredModelConfigs.length,
            successfulEvaluations: evaluationResults.length,
            failedEvaluations: errors.length,
            totalBaselineResults,
          },
          promptComparisons: finalResults,
          errors: errors.length > 0 ? errors : undefined,
        },
        null,
        2
      )
    );

    console.log(`✅ Results saved to: ${outputFile}`);

    // Summary statistics
    console.log("\n📊 Summary Statistics:");

    // Quality level distribution
    const qualityLevels = allVariations.reduce((acc, v) => {
      acc[v.variation.qualityLevel] = (acc[v.variation.qualityLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("\n🎭 Variation Quality Distribution:");
    Object.entries(qualityLevels).forEach(([level, count]) => {
      console.log(`   ${level}: ${count} variations`);
    });

    // Prompt-by-prompt comparison
    console.log("\n📈 Prompt-by-Prompt Comparison (Fuzzy vs Baseline):");
    finalResults.forEach((promptResult) => {
      console.log(`\n🎯 ${promptResult.promptName}:`);
      console.log(`   Fuzzy Summary:`);
      console.log(
        `     Average Score: ${promptResult.fuzzySummary.averageScore.toFixed(
          3
        )} (${promptResult.fuzzySummary.averageLabel})`
      );
      console.log(`     Modal Label: ${promptResult.fuzzySummary.modalLabel}`);
      console.log(
        `     Evaluations: ${promptResult.fuzzySummary.totalEvaluations}`
      );

      if (promptResult.baselineSummary) {
        console.log(`   Baseline Summary:`);
        console.log(
          `     Average Score: ${promptResult.baselineSummary.averageScore.toFixed(
            3
          )} (${promptResult.baselineSummary.averageLabel})`
        );
        console.log(
          `     Modal Label: ${promptResult.baselineSummary.modalLabel}`
        );
        console.log(
          `     Evaluations: ${promptResult.baselineSummary.totalEvaluations}`
        );

        // Score difference
        const scoreDiff =
          promptResult.fuzzySummary.averageScore -
          promptResult.baselineSummary.averageScore;
        const diffIcon = scoreDiff > 0 ? "📈" : scoreDiff < 0 ? "📉" : "➡️";
        console.log(
          `   Difference: ${diffIcon} ${
            scoreDiff > 0 ? "+" : ""
          }${scoreDiff.toFixed(3)}`
        );
      } else {
        console.log(`   Baseline Summary: No baseline data available`);
      }
    });

    // Overall averages
    const overallFuzzyAvg =
      finalResults.reduce((sum, r) => sum + r.fuzzySummary.averageScore, 0) /
      finalResults.length;
    const baselineResults_list = finalResults.filter(
      (r) => r.baselineSummary !== null
    );
    const overallBaselineAvg =
      baselineResults_list.length > 0
        ? baselineResults_list.reduce(
            (sum, r) => sum + r.baselineSummary!.averageScore,
            0
          ) / baselineResults_list.length
        : null;

    console.log("\n📊 Overall Comparison:");
    console.log(`   Overall Fuzzy Average: ${overallFuzzyAvg.toFixed(3)}`);
    if (overallBaselineAvg !== null) {
      console.log(
        `   Overall Baseline Average: ${overallBaselineAvg.toFixed(3)}`
      );
      const overallDiff = overallFuzzyAvg - overallBaselineAvg;
      const diffIcon = overallDiff > 0 ? "📈" : overallDiff < 0 ? "📉" : "➡️";
      console.log(
        `   Overall Difference: ${diffIcon} ${
          overallDiff > 0 ? "+" : ""
        }${overallDiff.toFixed(3)}`
      );
    } else {
      console.log(`   Overall Baseline Average: No baseline data available`);
    }
  } finally {
    await db.disconnect();
  }
}

// Run the script
main().catch(console.error);
