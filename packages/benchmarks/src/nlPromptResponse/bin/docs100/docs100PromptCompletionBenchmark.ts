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

import { docs100Config } from "./config";

runNlPromptResponseBenchmark({
  ...docs100Config,
  models,
  judgeModelsConfig,
  experimentType: EXPERIMENT_TYPE,
  maxConcurrentPerExperiment: MAX_CONCURRENCY,
  maxConcurrentExperiments: MAX_CONCURRENT_EXPERIMENTS,
  braintrustApiKey: BRAINTRUST_API_KEY,
});
