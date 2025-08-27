/**
 * Example script demonstrating how to use the evaluation core module
 * for custom evaluation scenarios without database dependency
 */

import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  evaluatePromptModelPairs,
  createEvaluationConfig,
  EvaluationTask,
} from "../evaluationCore";
import { getModel, getModels } from "../models";
import { createOutputs } from "../utils";
import type { MercuryPrompt } from "../database";

// Example: Evaluate a custom set of prompts for A/B testing
async function customEvaluationExample() {
  // Define custom prompts for testing
  const customPrompts: MercuryPrompt[] = [
    {
      _id: new ObjectId(),
      type: "question-answer",
      tags: ["mongodb", "performance"],
      name: "Database Indexing Question",
      prompt: [
        {
          role: "user",
          content: "How can I optimize MongoDB query performance?",
        },
      ],
      expected:
        "Use appropriate indexes, optimize query patterns, and consider aggregation pipeline optimization.",
      metadata: {
        category: "performance",
        profoundPromptId: "perf-001",
      },
      analysis: {
        quality: {
          answer_fit: { score: 0.9 },
          answer_reasonableness: { score: 0.85 },
          business_impact: { score: 0.8 },
          prompt_clarity: { score: 0.95 },
          prompt_knowledge_assumption: { score: 0.85 },
        },
        relevance: 0.9,
      },
    },
    {
      _id: new ObjectId(),
      type: "question-answer",
      tags: ["mongodb", "schema"],
      name: "Schema Design Question",
      prompt: [
        {
          role: "user",
          content: "What are best practices for MongoDB schema design?",
        },
      ],
      expected:
        "Consider embedding vs referencing, design for your queries, and normalize when necessary.",
      metadata: {
        category: "design",
        profoundPromptId: "design-001",
      },
      analysis: {
        quality: {
          answer_fit: { score: 0.95 },
          answer_reasonableness: { score: 0.95 },
          business_impact: { score: 0.9 },
          prompt_clarity: { score: 0.98 },
          prompt_knowledge_assumption: { score: 0.9 },
        },
        relevance: 0.95,
      },
    },
  ];

  // Select specific models for comparison
  const modelsToTest = getModels(["gpt-4o", "gpt-4o-mini", "claude-35-sonnet"]);

  // Create evaluation tasks
  const evaluationTasks: EvaluationTask[] = customPrompts.flatMap((prompt) =>
    modelsToTest.map((model) => ({ prompt, model }))
  );

  // Configure evaluation
  const evaluationConfig = createEvaluationConfig({
    braintrustProxyEndpoint: process.env.BRAINTRUST_PROXY_ENDPOINT!,
    braintrustApiKey: process.env.BRAINTRUST_API_KEY!,
    judgmentModel: getModel("gpt-4.1"),
  });

  console.log(
    `Starting evaluation of ${evaluationTasks.length} prompt-model pairs...`
  );
  console.log(`Prompts: ${customPrompts.length}`);
  console.log(`Models: ${modelsToTest.map((m) => m.label).join(", ")}`);

  // Run evaluation with progress tracking
  let completedCount = 0;
  const { results, errors } = await evaluatePromptModelPairs(
    evaluationTasks,
    evaluationConfig,
    {
      concurrency: 5,
      onProgress: (completed, total) => {
        completedCount = completed;
        console.log(
          `Progress: ${completed}/${total} (${Math.round(
            (completed / total) * 100
          )}%)`
        );
      },
    }
  );

  console.log("\n=== Evaluation Complete ===");
  console.log(`Successfully evaluated: ${results.length} prompt-model pairs`);
  console.log(`Failed evaluations: ${errors.length}`);

  // Analyze results by model
  const resultsByModel = results.reduce((acc, result) => {
    if (!acc[result.model]) {
      acc[result.model] = [];
    }
    acc[result.model].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  console.log("\n=== Results Summary ===");
  for (const [model, modelResults] of Object.entries(resultsByModel)) {
    const avgScore =
      modelResults.reduce(
        (sum, r) => sum + r.metrics.referenceAlignment.score,
        0
      ) / modelResults.length;

    console.log(`${model}:`);
    console.log(`  - Average Score: ${avgScore.toFixed(3)}`);
    console.log(`  - Successful Evaluations: ${modelResults.length}`);

    // Show score distribution
    const scoreDistribution = modelResults.reduce(
      (acc, r) => {
        const score = r.metrics.referenceAlignment.score;
        if (score >= 0.8) acc.high++;
        else if (score >= 0.6) acc.medium++;
        else acc.low++;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    console.log(
      `  - Score Distribution: High(≥0.8): ${scoreDistribution.high}, Medium(0.6-0.8): ${scoreDistribution.medium}, Low(<0.6): ${scoreDistribution.low}`
    );
  }

  // Save detailed results
  const outputPath = createOutputs({
    outputDir: "./evaluation-results",
    errors,
    results,
    skipped: [],
  });

  console.log(`\nDetailed results saved to: ${outputPath.resultsFile}`);
  console.log(`Errors saved to: ${outputPath.errorsFile}`);

  return { results, errors, outputPath };
}

// Example: Quick single prompt evaluation
async function quickEvaluationExample() {
  const testPrompt: MercuryPrompt = {
    _id: new ObjectId(),
    type: "question-answer",
    tags: ["test"],
    name: "Quick Test",
    prompt: [{ role: "user", content: "What is MongoDB?" }],
    expected: "MongoDB is a NoSQL document database.",
    metadata: {
      category: "basics",
      profoundPromptId: "quick-001",
    },
    analysis: {
      quality: {
        answer_fit: { score: 0.8 },
        answer_reasonableness: { score: 0.85 },
        business_impact: { score: 0.7 },
        prompt_clarity: { score: 0.9 },
        prompt_knowledge_assumption: { score: 0.8 },
      },
      relevance: 0.8,
    },
  };

  const singleTask: EvaluationTask = {
    prompt: testPrompt,
    model: getModel("gpt-4o"),
  };

  const evaluationConfig = createEvaluationConfig({
    braintrustProxyEndpoint: process.env.BRAINTRUST_PROXY_ENDPOINT!,
    braintrustApiKey: process.env.BRAINTRUST_API_KEY!,
    judgmentModel: getModel("gpt-4.1"),
  });

  console.log("Running quick evaluation...");

  const { results, errors } = await evaluatePromptModelPairs(
    [singleTask],
    evaluationConfig
  );

  if (results.length > 0) {
    const result = results[0];
    console.log("✅ Evaluation successful!");
    console.log(`Response: ${result.response}`);
    console.log(`Score: ${result.metrics.referenceAlignment.score}`);
    console.log(`Rationale: ${result.metrics.referenceAlignment.rationale}`);
  } else {
    console.log("❌ Evaluation failed:", errors[0]);
  }

  return { results, errors };
}

// Example: Comparative model analysis
async function compareModelsExample() {
  const comparisonPrompt: MercuryPrompt = {
    _id: new ObjectId(),
    type: "question-answer",
    tags: ["comparison"],
    name: "Model Comparison Test",
    prompt: [
      {
        role: "user",
        content:
          "Explain the advantages of using MongoDB for modern web applications.",
      },
    ],
    expected:
      "MongoDB offers flexible schema, horizontal scaling, rich query language, and strong consistency with high availability.",
    metadata: {
      category: "product",
      profoundPromptId: "comp-001",
    },
    analysis: {
      quality: {
        answer_fit: { score: 1.0 },
        answer_reasonableness: { score: 0.95 },
        business_impact: { score: 0.9 },
        prompt_clarity: { score: 1.0 },
        prompt_knowledge_assumption: { score: 0.9 },
      },
      relevance: 1.0,
    },
  };

  // Compare different model sizes/capabilities
  const modelsToCompare = [
    getModel("gpt-4o"),
    getModel("gpt-4o-mini"),
    getModel("claude-35-sonnet"),
    getModel("llama-3.1-70b"),
  ];

  const tasks: EvaluationTask[] = modelsToCompare.map((model) => ({
    prompt: comparisonPrompt,
    model,
  }));

  const evaluationConfig = createEvaluationConfig({
    braintrustProxyEndpoint: process.env.BRAINTRUST_PROXY_ENDPOINT!,
    braintrustApiKey: process.env.BRAINTRUST_API_KEY!,
    judgmentModel: getModel("gpt-4.1"),
  });

  console.log("Comparing models on the same prompt...");

  const { results, errors } = await evaluatePromptModelPairs(
    tasks,
    evaluationConfig,
    { concurrency: 2 }
  );

  console.log("\n=== Model Comparison Results ===");
  results
    .sort(
      (a, b) =>
        b.metrics.referenceAlignment.score - a.metrics.referenceAlignment.score
    )
    .forEach((result, index) => {
      console.log(`${index + 1}. ${result.model}:`);
      console.log(
        `   Score: ${result.metrics.referenceAlignment.score.toFixed(3)}`
      );
      console.log(`   Response: ${result.response.substring(0, 100)}...`);
      console.log(
        `   Rationale: ${result.metrics.referenceAlignment.rationale}`
      );
      console.log("");
    });

  return { results, errors };
}

// Export for use in other scripts
export {
  customEvaluationExample,
  quickEvaluationExample,
  compareModelsExample,
};

// Run example if called directly
if (require.main === module) {
  const example = process.argv[2];

  switch (example) {
    case "custom":
      customEvaluationExample().catch(console.error);
      break;
    case "quick":
      quickEvaluationExample().catch(console.error);
      break;
    case "compare":
      compareModelsExample().catch(console.error);
      break;
    default:
      console.log("Usage: ts-node customEvaluation.ts [custom|quick|compare]");
      console.log("");
      console.log("Examples:");
      console.log(
        "  custom  - Run full custom evaluation with multiple prompts and models"
      );
      console.log("  quick   - Run a quick single prompt evaluation");
      console.log("  compare - Compare multiple models on the same prompt");
  }
}
