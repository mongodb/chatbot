import "dotenv/config";
import { techSupportConfig } from "./config";
import { runNlPromptResponseBenchmark } from "../../runNlPromptResponseBenchmark";
import {
  models,
  judgeModelsConfig,
  MAX_CONCURRENT_EXPERIMENTS,
  MAX_CONCURRENCY,
  EXPERIMENT_TYPE,
  BRAINTRUST_API_KEY,
} from "../globalConfig";

runNlPromptResponseBenchmark({
  ...techSupportConfig,
  models,
  judgeModelsConfig,
  experimentType: EXPERIMENT_TYPE,
  maxConcurrentPerExperiment: MAX_CONCURRENCY,
  maxConcurrentExperiments: MAX_CONCURRENT_EXPERIMENTS,
  braintrustApiKey: BRAINTRUST_API_KEY,
});
