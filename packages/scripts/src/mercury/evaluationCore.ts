import { createOpenAI, generateText } from "mongodb-rag-core/aiSdk";
import { OpenAI } from "mongodb-rag-core/openai";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { makeReferenceAlignment } from "benchmarks";
import { ModelConfig } from "mongodb-rag-core/models";
import { GenerationFailedError, ScoringFailedError } from "./errors";
import { mapReferenceAlignmentScoreToTag } from "./utils";
import type { MercuryPrompt, MercuryResult } from "./database";

export interface EvaluationConfig {
  /** OpenAI client for model inference */
  inferenceClient: OpenAI;
  /** OpenAI client for scoring/judgment */
  scoringClient: OpenAI;
  /** Model configuration for the judgment model */
  judgmentModel: ModelConfig;
  /** Braintrust settings for creating clients */
  braintrust: {
    endpoint: string;
    apiKey: string;
  };
}

export interface EvaluationTask {
  prompt: MercuryPrompt;
  model: ModelConfig;
}

export interface EvaluationResult {
  success: true;
  result: MercuryResult;
}

export interface EvaluationError {
  success: false;
  error: GenerationFailedError | ScoringFailedError;
}

export type EvaluationOutcome = EvaluationResult | EvaluationError;

/**
 * Core evaluation function that takes a single prompt-model pair and returns either
 * a successful result or an error. This is the pure business logic without any
 * database, batching, or I/O concerns.
 */
export async function evaluatePromptWithModel(
  task: EvaluationTask,
  config: EvaluationConfig
): Promise<EvaluationOutcome> {
  const { prompt, model } = task;
  const { inferenceClient, scoringClient, judgmentModel } = config;

  // Step 1: Generate response using the model
  let generatedResponse: Awaited<ReturnType<typeof generateText>>;
  try {
    generatedResponse = await generateText({
      model: createOpenAI({
        baseURL: config.braintrust.endpoint,
        apiKey: config.braintrust.apiKey,
      }).chat(model.deployment),
      messages: prompt.prompt,
    });
  } catch (error) {
    return {
      success: false,
      error: new GenerationFailedError({
        prompt,
        model: model.label,
        error: error instanceof Error ? error : new Error(String(error)),
      }),
    };
  }

  // Step 2: Score the response using reference alignment
  const scoreReferenceAlignment = makeReferenceAlignment(
    scoringClient,
    {
      model: judgmentModel.deployment,
      temperature: 0,
    },
    judgmentModel.label
  );

  const scorerArgs = {
    input: {
      messages: prompt.prompt as [{ role: "user"; content: string }],
    },
    output: { response: generatedResponse.text },
    expected: { reference: prompt.expected, links: [] },
    metadata: {
      model: model.label,
      temperature: 0,
    },
  };

  try {
    const score = await scoreReferenceAlignment(scorerArgs);
    const result: MercuryResult = {
      _id: new ObjectId(),
      promptId: prompt._id,
      model: model.label,
      developer: model.developer,
      provider: model.developer, // Legacy field
      date: new Date(),
      prompt: prompt.name,
      response: generatedResponse.text,
      metrics: {
        referenceAlignment: {
          score: score.score ?? -1,
          label: mapReferenceAlignmentScoreToTag(score.score) ?? undefined,
          rationale:
            (score.metadata?.rationale as string | undefined) ?? undefined,
          judgementModel: judgmentModel.label,
        },
      },
    };

    return {
      success: true,
      result,
    };
  } catch (error) {
    return {
      success: false,
      error: new ScoringFailedError({
        prompt,
        model: model.label,
        scorer: scorerArgs,
        error: error instanceof Error ? error : new Error(String(error)),
      }),
    };
  }
}

/**
 * Evaluates multiple prompt-model pairs. This function handles the parallel
 * execution and result aggregation, but doesn't handle batching, database
 * operations, or file I/O.
 */
export async function evaluatePromptModelPairs(
  tasks: EvaluationTask[],
  config: EvaluationConfig,
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<{
  results: MercuryResult[];
  errors: (GenerationFailedError | ScoringFailedError)[];
}> {
  const { concurrency = 10, onProgress } = options;
  const results: MercuryResult[] = [];
  const errors: (GenerationFailedError | ScoringFailedError)[] = [];

  // Process tasks in chunks to respect concurrency limits
  const chunks: EvaluationTask[][] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    chunks.push(tasks.slice(i, i + concurrency));
  }

  let completedCount = 0;

  for (const chunk of chunks) {
    const chunkPromises = chunk.map((task) =>
      evaluatePromptWithModel(task, config)
    );

    const chunkResults = await Promise.all(chunkPromises);

    for (const outcome of chunkResults) {
      if (outcome.success) {
        results.push(outcome.result);
      } else {
        errors.push(outcome.error);
      }
      completedCount++;
      onProgress?.(completedCount, tasks.length);
    }
  }

  return { results, errors };
}

/**
 * Creates an evaluation configuration from environment-like settings
 */
export function createEvaluationConfig(settings: {
  braintrustProxyEndpoint: string;
  braintrustApiKey: string;
  judgmentModel: ModelConfig;
}): EvaluationConfig {
  const openAIClient = new OpenAI({
    baseURL: settings.braintrustProxyEndpoint,
    apiKey: settings.braintrustApiKey,
  });

  return {
    inferenceClient: openAIClient,
    scoringClient: openAIClient,
    judgmentModel: settings.judgmentModel,
    braintrust: {
      endpoint: settings.braintrustProxyEndpoint,
      apiKey: settings.braintrustApiKey,
    },
  };
}
