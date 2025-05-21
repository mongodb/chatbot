import "dotenv/config";
import { topQuestionsConfig } from "./config";
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
  ...topQuestionsConfig,
  models,
  judgeModelsConfig,
  experimentType: EXPERIMENT_TYPE,
  maxConcurrentPerExperiment: MAX_CONCURRENCY,
  maxConcurrentExperiments: MAX_CONCURRENT_EXPERIMENTS,
  braintrustApiKey: BRAINTRUST_API_KEY,
  filterDataset: (de) => {
    // Only return top 100 tech support questions
    if (de.tags.includes("tech_support")) {
      if (de.tags.includes("ts_top_100")) {
        return true;
      }
      return false;
    }
    // Otherwise return all
    return true;
  },
});
