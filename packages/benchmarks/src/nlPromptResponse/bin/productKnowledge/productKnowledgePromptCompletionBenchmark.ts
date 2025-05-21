import "dotenv/config";
import {
  MAX_CONCURRENT_EXPERIMENTS,
  PROJECT_NAME,
  EXPERIMENT_BASE_NAME,
  EXPERIMENT_TYPE,
  DATASET_NAME,
  initialMessages,
  judgeModelsConfig,
  MAX_CONCURRENCY,
  models,
  runNlPromptResponseBenchmark,
} from "./config";

runNlPromptResponseBenchmark({
  models,
  judgeModelsConfig,
  datasetName: DATASET_NAME,
  experimentBaseName: EXPERIMENT_BASE_NAME,
  initialMessages,
  projectName: PROJECT_NAME,
  experimentType: EXPERIMENT_TYPE,
  maxConcurrentPerExperiment: MAX_CONCURRENCY,
  maxConcurrentExperiments: MAX_CONCURRENT_EXPERIMENTS,
});
