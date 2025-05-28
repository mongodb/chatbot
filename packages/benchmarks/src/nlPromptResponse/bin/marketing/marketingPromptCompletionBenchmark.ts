import "dotenv/config";
import {
  models,
  judgeModelsConfig,
  MAX_CONCURRENT_EXPERIMENTS,
  MAX_CONCURRENCY,
  EXPERIMENT_TYPE,
  BRAINTRUST_API_KEY,
} from "../globalConfig";
import { runNlPromptResponseBenchmark } from "../../runNlPromptResponseBenchmark";

import { marketingConfig } from "./config";

runNlPromptResponseBenchmark({
  ...marketingConfig,
  models,
  judgeModelsConfig,
  experimentType: EXPERIMENT_TYPE,
  maxConcurrentPerExperiment: MAX_CONCURRENCY,
  maxConcurrentExperiments: MAX_CONCURRENT_EXPERIMENTS,
  braintrustApiKey: BRAINTRUST_API_KEY,
});
