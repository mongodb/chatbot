import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { TEXT_TO_DRIVER_ENV_VARS } from "../../TextToDriverEnvVars";
import { ModelConfig, models } from "mongodb-rag-core/models";
import { strict as assert } from "assert";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import {
  SchemaStrategy,
  SystemPromptStrategy,
} from "../../generateDriverCode/languagePrompts/PromptStrategies";
import {
  makeQueryPerformanceMongoh,
  ReasonableOutput,
  SuccessfulExecution,
} from "../../evaluationMetrics";

export const DATASET_NAME =
  "atlas_sample_data_benchmark_gpt-4o_filtered_with_execution_time";

export const PROJECT_NAME = "natural-language-to-mongosh";

export const EXPERIMENT_BASE_NAME = "mongosh-benchmark-official";

export const {
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
  MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
} = assertEnvVars({
  ...TEXT_TO_DRIVER_ENV_VARS,
  ...BRAINTRUST_ENV_VARS,
});

export const schemaStrategies: SchemaStrategy[] = [
  "annotated",
  "interpreted",
  "none",
] as const;
export const systemPromptStrategies: SystemPromptStrategy[] = [
  "default",
  "chainOfThought",
  "lazy",
] as const;

export const experimentTypes = [
  "toolCall",
  "agentic",
  "promptCompletion",
] as const;

export const fewShot = [true, false];

export interface Experiment {
  model: (typeof MODELS)[number];
  schemaStrategy: SchemaStrategy;
  systemPromptStrategy: SystemPromptStrategy;
  type: (typeof experimentTypes)[number];
  fewShot?: boolean;
}

export const MAX_CONCURRENT_EXPERIMENTS = 4;

export const MAX_CONCURRENT_MODELS = 2;

export const MODELS: ModelConfig[] = (
  [
    // benchmark models
    // "gpt-4o-mini",
    // "gpt-4o",
    // "o3-mini",
    // "claude-35-haiku",
    "claude-37-sonnet",
    "llama-3.3-70b",
    // "gemini-2-flash",
    // "nova-pro-v1:0",
    // "mistral-large-2",
    // "gpt-4.1-nano",
    // "gpt-4.1-mini",
    // "gpt-4.1",
    // "gemini-2.5-flash-preview-05-20",
  ] satisfies (typeof models)[number]["label"][]
).map((label) => {
  const model = models.find((m) => m.label === label);
  assert(model, `Model ${label} not found`);
  return model;
});

export function makeLlmOptions(
  model: ModelConfig
): Omit<LlmOptions, "openAiClient"> {
  // Different because o3-mini has slightly different options
  if (model.label === "o3-mini") {
    return {
      model: model.deployment,
      max_completion_tokens: 3000,
    };
  }
  return {
    model: model.deployment,
    temperature: 0,
    max_tokens: 3000,
  };
}

export const mongoshScores = [
  SuccessfulExecution,
  ReasonableOutput,
  makeQueryPerformanceMongoh(MONGODB_TEXT_TO_DRIVER_CONNECTION_URI),
];
