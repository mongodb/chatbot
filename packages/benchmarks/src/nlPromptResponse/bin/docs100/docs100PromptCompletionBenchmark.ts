import "dotenv/config";
import {
  runNlPromptResponseBenchmark,
  models,
  judgeModelsConfig,
  MAX_CONCURRENT_EXPERIMENTS,
  MAX_CONCURRENCY,
  EXPERIMENT_TYPE,
} from "../globalConfig";

import { docs100Config } from "./config";

runNlPromptResponseBenchmark({
  ...docs100Config,
  models,
  judgeModelsConfig,
  experimentType: EXPERIMENT_TYPE,
  maxConcurrentPerExperiment: MAX_CONCURRENCY,
  maxConcurrentExperiments: MAX_CONCURRENT_EXPERIMENTS,
});
