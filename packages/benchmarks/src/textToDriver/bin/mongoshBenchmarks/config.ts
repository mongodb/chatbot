import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { TEXT_TO_DRIVER_ENV_VARS } from "../../TextToDriverEnvVars";
import { ModelConfig, models } from "mongodb-rag-core/models";
import { strict as assert } from "assert";
import { LlmOptions } from "mongodb-rag-core/executeCode";

export const DATASET_NAME = "atlas_sample_data_benchmark_gpt-4o_filtered";

export const PROJECT_NAME = "natural-language-to-mongosh";

export const {
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
  MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
} = assertEnvVars({
  ...TEXT_TO_DRIVER_ENV_VARS,
  ...BRAINTRUST_ENV_VARS,
});

export const MAX_CONCURRENT_EXPERIMENTS = 5;

export const MODELS: ModelConfig[] = [
  // "gpt-4o",
  // "gpt-4o-mini",
  // "claude-37-sonnet",
  "o3-mini",
].map((label) => {
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
      max_completion_tokens: 1000,
    };
  }
  return {
    model: model.deployment,
    temperature: 0,
    max_tokens: 1000,
  };
}
