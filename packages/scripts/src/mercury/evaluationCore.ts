import {
  createOpenAI,
  generateText,
  OpenAIProvider,
  type ProviderV2,
} from "mongodb-rag-core/aiSdk";
import { OpenAI } from "mongodb-rag-core/openai";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { makeReferenceAlignment } from "benchmarks";
import { ModelConfig, ModelProvider } from "mongodb-rag-core/models";
import { GenerationFailedError, ScoringFailedError } from "./errors";
import { mapReferenceAlignmentScoreToTag } from "./utils";
import type { MercuryPrompt, MercuryResult } from "./database";

export interface EvaluationConfig {
  generatorClientFactories: Partial<Record<ModelProvider, () => ProviderV2>>;
  judgementClient: OpenAI; // Need to use OpenAI instead of ProviderV2 due to legacy code
  judgementModel: ModelConfig;
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

function mapModelProviderToGeneratorMethod(
  generatorClient: ProviderV2,
  provider: ModelProvider
) {
  switch (provider) {
    case "braintrust":
      return (generatorClient as OpenAIProvider).chat;
    case "aws-bedrock":
    default:
      return generatorClient.languageModel;
  }
}

/**
 Core evaluation function that takes a single prompt-model pair and returns either
 a successful result or an error. This is the pure business logic without any
 database, batching, or I/O concerns.
 */
export async function evaluatePromptWithModel(
  task: EvaluationTask,
  config: EvaluationConfig
): Promise<EvaluationOutcome> {
  const { prompt, model } = task;
  const { generatorClientFactories, judgementClient, judgementModel } = config;
  const generatorClient = generatorClientFactories[model.provider]?.();
  if (!generatorClient) {
    throw new Error(`Client for ${model.provider} is not defined`);
  }
  const generator = mapModelProviderToGeneratorMethod(
    generatorClient,
    model.provider
  );
  if (!generatorClient) {
    throw new Error(`Client for ${model.provider} is not defined`);
  }

  // Step 1: Generate response using the model
  let generatedResponse: Awaited<ReturnType<typeof generateText>>;
  try {
    generatedResponse = await generateText({
      model: generator(model.deployment),
      // messages: prompt.prompt,
      prompt: prompt.prompt[0].content as string,
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
    judgementClient,
    {
      model: judgementModel.deployment,
      temperature: 0,
    },
    judgementModel.label
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
          judgementModel: judgementModel.label,
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
 Evaluates multiple prompt-model pairs. This function handles the parallel
 execution and result aggregation, but doesn't handle batching, database
 operations, or file I/O.
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
 Creates an evaluation configuration from environment-like settings
 */
export function createEvaluationConfig(settings: {
  generatorClientFactories: Partial<Record<ModelProvider, () => ProviderV2>>;
  judgementClient: OpenAI;
  judgementModel: ModelConfig;
}): EvaluationConfig {
  return {
    generatorClientFactories: settings.generatorClientFactories,
    judgementClient: settings.judgementClient,
    judgementModel: settings.judgementModel,
  };
}
