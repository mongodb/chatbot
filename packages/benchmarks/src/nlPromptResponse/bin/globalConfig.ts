import { getModelsFromLabels } from "../../benchmarkModels";
import { assertEnvVars } from "mongodb-rag-core";

const { BRAINTRUST_API_KEY } = assertEnvVars({
  BRAINTRUST_API_KEY: "",
});
export { BRAINTRUST_API_KEY };

export const EXPERIMENT_TYPE = "prompt-response";

export const MAX_CONCURRENT_EXPERIMENTS = 2;

// Have to set low to allow for judge token limits :(
export const MAX_CONCURRENCY = 15;

export const judgeModelsConfig = getModelsFromLabels(["gpt-4.1"]);

export const models = getModelsFromLabels([
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "claude-37-sonnet",
  "gpt-4o",
  "gpt-4o-mini",
  "claude-35-sonnet-v2",
  "claude-35-sonnet",
  "llama-3.1-70b",
  "llama-3.2-90b",
  "llama-3.3-70b",
  "o3-mini",
  "o3",
  "o4-mini",
  "gemini-2-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro-preview-03-25",
]);
