import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { TEXT_TO_DRIVER_ENV_VARS } from "../../TextToDriverEnvVars";
import { makeTextToDriverEval } from "../../TextToDriverEval";
import { loadTextToDriverBraintrustEvalCases } from "../../loadBraintrustDatasets";
import { ReasonableOutput, SuccessfulExecution } from "../../evaluationMetrics";
import { annotatedDbSchemas } from "../../generateDriverCode/annotatedDbSchemas";
import { createOpenAI } from "@ai-sdk/openai";
import { wrapAISDKModel } from "mongodb-rag-core/braintrust";
import { models } from "mongodb-rag-core/models";
import { strict as assert } from "assert";
import { makeGenerateMongoshCodeSimpleTask } from "../../generateDriverCode/generateMongoshCodeSimpleToolCall";

async function main() {
  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_ENDPOINT,
    MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
  } = assertEnvVars({
    ...TEXT_TO_DRIVER_ENV_VARS,
    ...BRAINTRUST_ENV_VARS,
  });
  const label = "claude-37-sonnet";
  const model = models.find((m) => m.label === label);
  assert(model, `Model ${label} not found`);

  const projectName = "natural-language-to-mongosh";
  const llmOptions = {
    model: model.deployment,
    temperature: 0,
    max_tokens: 1000,
  };
  const maxConcurrency = 10;
  const schemaStrategy = "annotated";
  const experimentName = `mongosh-benchmark-simple-tool-call-${schemaStrategy}-schema-${label}`;
  console.log(`Running experiment: ${experimentName}`);

  await makeTextToDriverEval({
    apiKey: BRAINTRUST_API_KEY,
    projectName,
    experimentName,
    data: loadTextToDriverBraintrustEvalCases({
      apiKey: BRAINTRUST_API_KEY,
      projectName,
      datasetName: "atlas_sample_data_benchmark_gpt-4o",
    }),
    maxConcurrency,

    task: makeGenerateMongoshCodeSimpleTask({
      uri: MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
      databaseInfos: annotatedDbSchemas,
      llmOptions,
      openai: wrapAISDKModel(
        createOpenAI({
          apiKey: BRAINTRUST_API_KEY,
          baseURL: BRAINTRUST_ENDPOINT,
        }).chat(llmOptions.model, {
          structuredOutputs: true,
        })
      ),
      schemaStrategy,
    }),
    metadata: {
      llmOptions,
    },
    scores: [SuccessfulExecution, ReasonableOutput],
  });
}

main();
