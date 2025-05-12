import PromisePool from "@supercharge/promise-pool";
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
} from "./config";
import { makeNlPromptCompletionTask } from "../../nlPromptCompletionTask";
import {
  NlPromptResponseEvalCase,
  runNlPromptResponseEval,
} from "../../NlQuestionAnswerEval";
import { initDataset, wrapOpenAI } from "mongodb-rag-core/braintrust";
import { getOpenAiEndpointAndApiKey } from "mongodb-rag-core/models";
import { OpenAI } from "mongodb-rag-core/openai";
import { makeReferenceAlignment } from "../../metrics";
import { makeExperimentName } from "../../../makeExperimentName";
import { makeLlmOptions } from "../../../openAiClients";
import { BRAINTRUST_API_KEY } from "../../../textToDriver/bin/mongoshBenchmarks/config";
import "dotenv/config";
async function main() {
  const judgeClients = await Promise.all(
    judgeModelsConfig.map(async (m) => {
      const endpointAndKey = await getOpenAiEndpointAndApiKey(m);
      console.log(`Judge model: ${m.label}`);
      return {
        openAiClient: new OpenAI(endpointAndKey),
        model: m.deployment,
        temperature: 0,
        label: m.label,
      };
    })
  );
  const judgeMetrics = judgeClients.map(({ label, ...config }) =>
    makeReferenceAlignment(config, label)
  );

  await PromisePool.for(models)
    .withConcurrency(MAX_CONCURRENT_EXPERIMENTS)
    .process(async (model) => {
      const openAiClient = wrapOpenAI(
        new OpenAI({
          ...(await getOpenAiEndpointAndApiKey(model)),
        })
      );
      const staticLlmOptions = makeLlmOptions(model);
      const llmOptions = { openAiClient, ...staticLlmOptions };

      const experimentName = makeExperimentName({
        baseName: EXPERIMENT_BASE_NAME,
        experimentType: EXPERIMENT_TYPE,
        model: model.label,
      });

      console.log(`Running experiment: ${experimentName}`);

      return runNlPromptResponseEval({
        data: initDataset(PROJECT_NAME, {
          apiKey: BRAINTRUST_API_KEY,
          dataset: DATASET_NAME,
        }).fetchedData() as unknown as NlPromptResponseEvalCase[],
        projectName: PROJECT_NAME,
        experimentName,
        additionalMetadata: {
          judgeModelsConfig,
          ...staticLlmOptions,
          model: model.label,
        },
        task: makeNlPromptCompletionTask({
          llmOptions,
          initialMessages,
        }),
        maxConcurrency: MAX_CONCURRENCY,
        scorers: judgeMetrics,
      });
    });
}

main();
