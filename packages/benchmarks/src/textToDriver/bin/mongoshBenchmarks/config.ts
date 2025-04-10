import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { TEXT_TO_DRIVER_ENV_VARS } from "../../TextToDriverEnvVars";
import { ModelConfig, models } from "mongodb-rag-core/models";
import { strict as assert } from "assert";
import { LlmOptions } from "mongodb-rag-core/executeCode";

export const DATASET_NAME =
  "atlas_sample_data_benchmark_gpt-4o_filtered_with_execution_time";

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

export const MODELS: ModelConfig[] = (
  [
    "gpt-4o",
    "gpt-4o-mini",
    "claude-3-haiku",
    "claude-35-haiku",
    "claude-35-sonnet",
    "claude-35-sonnet-v2",
    "claude-37-sonnet",
    "o3-mini",
    "llama-3.1-70b",
    "llama-3.2-90b",
    "llama-3.3-70b",
    "gemini-1.5-flash-002",
    "gemini-2-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.0-pro-002",
    "gemini-1.5-pro-002",
    "nova-micro-v1:0",
    "nova-lite-v1:0",
    "nova-pro-v1:0",
    "mistral-large-2",
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
