import PromisePool from "@supercharge/promise-pool";
import { wrapOpenAI, initDataset } from "mongodb-rag-core/braintrust";
import {
  ModelConfig,
  getOpenAiEndpointAndApiKey,
} from "mongodb-rag-core/models";
import { OpenAI } from "mongodb-rag-core/openai";
import { makeExperimentName } from "../makeExperimentName";
import { makeLlmOptions } from "../openAiClients";
import { makeReferenceAlignment } from "./metrics";
import { makeNlPromptCompletionTask } from "./nlPromptCompletionTask";
import {
  runNlPromptResponseEval,
  NlPromptResponseEvalCase,
} from "./NlQuestionAnswerEval";

export interface DatasetConfig {
  projectName: string;
  datasetName: string;
}

export interface BenchmarkConfig {
  projectName: string;
  experimentBaseName: string;
  datasets: DatasetConfig[];
}

export const systemMessage = {
  role: "system",
  content:
    "You are a helpful MongoDB assistant. Answer the user's question directly, completely, and concisely.",
} satisfies OpenAI.Chat.ChatCompletionMessageParam;

export async function runNlPromptResponseBenchmark({
  models,
  judgeModelsConfig,
  projectName,
  datasets,
  experimentBaseName,
  experimentType,
  maxConcurrentPerExperiment,
  maxConcurrentExperiments,
  braintrustApiKey,
  filterDataset,
}: {
  models: ModelConfig[];
  judgeModelsConfig: ModelConfig[];
  datasets: DatasetConfig[];
  projectName: string;
  experimentBaseName: string;
  experimentType: string;
  maxConcurrentPerExperiment: number;
  maxConcurrentExperiments: number;
  braintrustApiKey: string;
  filterDataset?: (datasetEntry: NlPromptResponseEvalCase) => boolean;
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

      const datasetEntriesUnfiltered = (
        await Promise.all(
          datasets.map((dataset) => {
            return initDataset(dataset.projectName, {
              apiKey: braintrustApiKey,
              dataset: dataset.datasetName,
            }).fetchedData();
          })
        )
      ).flat() as unknown as NlPromptResponseEvalCase[];
      console.log(`Loaded ${datasetEntriesUnfiltered.length} records`);

      const datasetEntries = filterDataset
        ? datasetEntriesUnfiltered.filter(filterDataset)
        : datasetEntriesUnfiltered;
      console.log(`Filtered to ${datasetEntries.length} records`);

      return runNlPromptResponseEval({
        data: datasetEntries,
        projectName,
        experimentName,
        additionalMetadata: {
          judgeModelsConfig,
          ...staticLlmOptions,
        },
        task: makeNlPromptCompletionTask({
          llmOptions,
          initialMessages: [systemMessage],
        }),
        maxConcurrency: maxConcurrentPerExperiment,
        scorers: judgeMetrics,
      });
    });
}
