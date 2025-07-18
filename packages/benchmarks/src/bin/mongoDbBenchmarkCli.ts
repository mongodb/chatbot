#!/usr/bin/env node
import { createBenchmarkCli } from "../cli/index";
import { BenchmarkCliConfig } from "../cli/BenchmarkConfig";
import { MODELS } from "../benchmarkModels";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { multipleChoiceBenchmarkConfig } from "../quizQuestions/config";
import { nlPromptResponseBenchmark } from "../nlPromptResponse/config";

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

const config: BenchmarkCliConfig = {
  models: MODELS,
  modelProvider: {
    baseUrl: BRAINTRUST_ENDPOINT,
    apiKey: BRAINTRUST_API_KEY,
  },

  benchmarks: {
    multiple_choice: multipleChoiceBenchmarkConfig,
    nl_prompt_response: nlPromptResponseBenchmark,
    // TODO: resume here...
    discovery: {
      projectName: "TODO:...",
      datasets: {},
      tasks: {},
      scorers: {},
      description:
        "Discovery benchmark checks if MongoDB is mentioned in response",
    },
    nl_to_driver: {
      projectName: "TODO:...",
      datasets: {},
      tasks: {},
      scorers: {},
      description: "Natural language to driver (or Mongosh) code generation",
    },
  },
};

// Create and run the CLI
const cli = createBenchmarkCli(config);

// Make it executable
cli.parse();
