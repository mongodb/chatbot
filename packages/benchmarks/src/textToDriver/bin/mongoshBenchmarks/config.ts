import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { TEXT_TO_DRIVER_ENV_VARS } from "../../TextToDriverEnvVars";
import { MODELS } from "../../../benchmarkModels";
import { ModelConfig } from "mongodb-rag-core/models";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import {
  SchemaStrategy,
  SystemPromptStrategy,
} from "../../generateDriverCode/languagePrompts/PromptStrategies";
import { makeMongoshBenchmarkMetrics } from "../../evaluationMetrics";

export { MODELS } from "../../../benchmarkModels";

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

export const mongoshScores = makeMongoshBenchmarkMetrics(
  MONGODB_TEXT_TO_DRIVER_CONNECTION_URI
);
