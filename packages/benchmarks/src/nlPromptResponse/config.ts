import { initDataset, wrapOpenAI } from "mongodb-rag-core/braintrust";
import { OpenAI } from "mongodb-rag-core/openai";
import { makeNlPromptCompletionTask } from "./nlPromptCompletionTask";
import {
  NlPromptResponseEvalCaseInput,
  NlPromptResponseTaskOutput,
  NlPromptResponseTaskExpected,
  NlPromptResponseMetadata,
  NlPromptResponseEvalCase,
} from "./NlQuestionAnswerEval";
import { BenchmarkConfig, ModelProvider } from "../cli/BenchmarkConfig";
import { makeReferenceAlignment } from "./metrics";
import { getModelsFromLabels } from "../benchmarkModels";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { systemMessage } from "./runNlPromptResponseBenchmark";

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } = assertEnvVars({
  ...BRAINTRUST_ENV_VARS,
});

const projectName = "top-questions-prompt-completion";
const datasetName = "top-questions-prompt-completion";

// Have to set low to allow for judge token limits :(
export const MAX_CONCURRENCY = 15;

export const [judgeModelConfig] = getModelsFromLabels(["gpt-4.1"]);

const judgeOpenAiClient = wrapOpenAI(
  new OpenAI({
    baseURL: BRAINTRUST_ENDPOINT,
    apiKey: BRAINTRUST_API_KEY,
  })
);
export const nlPromptResponseBenchmark: BenchmarkConfig<
  NlPromptResponseEvalCaseInput,
  NlPromptResponseTaskOutput,
  NlPromptResponseTaskExpected,
  NlPromptResponseMetadata
> = {
  projectName,
  description: "Natural language prompt & response benchmark for MongoDB",

  datasets: {
    top_questions: {
      description: "Top human-curation questions from MongoDB documentation",
      async getDataset() {
        return initDataset(projectName, {
          apiKey: BRAINTRUST_API_KEY,
          dataset: datasetName,
        }).fetchedData() as unknown as NlPromptResponseEvalCase[];
      },
    },
  },

  tasks: {
    completion: {
      description: "Standard 1-shot completion task",
      taskFunc: (modelProvider: ModelProvider, deployment: string) => {
        return makeNlPromptCompletionTask({
          llmOptions: {
            openAiClient: wrapOpenAI(
              new OpenAI({
                baseURL: modelProvider.baseUrl,
                apiKey: modelProvider.apiKey,
              })
            ),
            model: deployment,
            temperature: 0,
          },
          initialMessages: [systemMessage],
        });
      },
    },
  },

  scorers: {
    reference_alignment: {
      description: `Reference alignment scoring using judge model ${judgeModelConfig.label} (our rebrand of OpenAI's Factuality)`,
      scorerFunc: makeReferenceAlignment(
        {
          openAiClient: judgeOpenAiClient,
          model: judgeModelConfig.deployment,
          temperature: 0,
        },
        judgeModelConfig.label
      ),
    },
  },
};
