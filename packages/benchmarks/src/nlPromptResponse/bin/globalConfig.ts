import { MODELS, getModelsFromLabels } from "../../benchmarkModels";
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

export const models = MODELS;
