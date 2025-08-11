#!/usr/bin/env node
import { makeBenchmarkCli } from "../cli/benchmarkCli";
import { BenchmarkCliConfig } from "../cli/BenchmarkConfig";
import { MODELS } from "../benchmarkModels";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { multipleChoiceBenchmarkConfig } from "../quizQuestions/config";
import { nlPromptResponseBenchmark } from "../nlPromptResponse/config";
import { discoveryBenchmarkConfig } from "../discovery/config";
import { nlToMongoshBenchmarkConfig } from "../nlToMql/nlToMongoshBenchmarkConfig";
import { nlToAtlasSearchBenchmarkConfig } from "../nlToMql/nltoAtlasSearchBenchmarkConfig";

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
    discovery: discoveryBenchmarkConfig,
    nl_to_mongosh: nlToMongoshBenchmarkConfig,
    nl_to_atlas_search: nlToAtlasSearchBenchmarkConfig,
  },
};

// Create and run the CLI
const cli = makeBenchmarkCli(config);

// Make it executable
cli.parse();
