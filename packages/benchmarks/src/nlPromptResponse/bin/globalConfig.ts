import PromisePool from "@supercharge/promise-pool";
import { wrapOpenAI, initDataset } from "mongodb-rag-core/braintrust";
import {
  getOpenAiEndpointAndApiKey,
  ModelConfig,
} from "mongodb-rag-core/models";
import { OpenAI } from "mongodb-rag-core/openai";
import { getModelsFromLabels, ModelWithLabel } from "../../benchmarkModels";
import { makeExperimentName } from "../../makeExperimentName";
import { makeLlmOptions } from "../../openAiClients";
import { BRAINTRUST_API_KEY } from "../../textToDriver/bin/mongoshBenchmarks/config";
import { makeReferenceAlignment } from "../metrics";
import { makeNlPromptCompletionTask } from "../nlPromptCompletionTask";
import {
  runNlPromptResponseEval,
  NlPromptResponseEvalCase,
} from "../NlQuestionAnswerEval";
export const EXPERIMENT_TYPE = "prompt-response";

export const MAX_CONCURRENT_EXPERIMENTS = 2;

// Have to set low to allow for judge token limits :(
export const MAX_CONCURRENCY = 15;

export const judgeModelsConfig = getModelsFromLabels(["gpt-4.1"]);

export const models = getModelsFromLabels([
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "claude-37-sonnet",
  "gpt-4o",
  "gpt-4o-mini",
  "claude-35-sonnet-v2",
  "claude-35-sonnet",
  "llama-3.1-70b",
  "llama-3.2-90b",
  "llama-3.3-70b",
]);

export interface BenchmarkConfig {
  datasetName: string;
  projectName: string;
  experimentBaseName: string;
  initialMessages: OpenAI.Chat.ChatCompletionMessageParam[];
}

export async function runNlPromptResponseBenchmark({
  models,
  judgeModelsConfig,
  projectName,
  datasetName,
  experimentBaseName,
  initialMessages,
  experimentType,
  maxConcurrentPerExperiment,
  maxConcurrentExperiments,
}: {
  models: ModelConfig[];
  judgeModelsConfig: ModelConfig[];
  projectName: string;
  datasetName: string;
  experimentBaseName: string;
  initialMessages: OpenAI.Chat.ChatCompletionMessageParam[];
  experimentType: string;
  maxConcurrentPerExperiment: number;
  maxConcurrentExperiments: number;
}) {
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
    .withConcurrency(maxConcurrentExperiments)
    .process(async (model) => {
      const openAiClient = wrapOpenAI(
        new OpenAI({
          ...(await getOpenAiEndpointAndApiKey(model)),
        })
      );
      const staticLlmOptions = makeLlmOptions(model);
      const llmOptions = { openAiClient, ...staticLlmOptions };

      const experimentName = makeExperimentName({
        baseName: experimentBaseName,
        experimentType,
        model: model.label,
      });

      console.log(`Running experiment: ${experimentName}`);

      return runNlPromptResponseEval({
        data: initDataset(projectName, {
          apiKey: BRAINTRUST_API_KEY,
          dataset: datasetName,
        }).fetchedData() as unknown as NlPromptResponseEvalCase[],
        projectName,
        experimentName,
        additionalMetadata: {
          judgeModelsConfig,
          ...staticLlmOptions,
        },
        task: makeNlPromptCompletionTask({
          llmOptions,
          initialMessages,
        }),
        maxConcurrency: maxConcurrentPerExperiment,
        scorers: judgeMetrics,
      });
    });
}
