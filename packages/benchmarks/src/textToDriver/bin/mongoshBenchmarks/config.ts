import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { TEXT_TO_DRIVER_ENV_VARS } from "../../TextToDriverEnvVars";

export { MODELS, makeLlmOptions } from "../../../openAiClients";

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
