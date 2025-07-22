<<<<<<< HEAD
import {
  initDataset,
  wrapAISDKModel,
  wrapOpenAI,
} from "mongodb-rag-core/braintrust";
=======
import { initDataset, wrapOpenAI } from "mongodb-rag-core/braintrust";
>>>>>>> upstream/main
import { OpenAI } from "mongodb-rag-core/openai";
import { makeNlPromptCompletionTask } from "./nlPromptCompletionTask";
import {
  NlPromptResponseEvalCaseInput,
  NlPromptResponseTaskOutput,
  NlPromptResponseTaskExpected,
  NlPromptResponseMetadata,
  NlPromptResponseEvalCase,
} from "./NlQuestionAnswerEval";
<<<<<<< HEAD
import { BenchmarkConfig } from "../cli/BenchmarkConfig";
import { makeReferenceAlignment } from "./metrics";
import { getModelsFromLabels } from "../benchmarkModels";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage } from "ai";

export const systemMessage = {
  role: "system",
  content:
    "You are a helpful MongoDB assistant. Answer the user's question directly, completely, and concisely.",
} satisfies CoreMessage;
=======
import { BenchmarkConfig, ModelProvider } from "../cli/BenchmarkConfig";
import { makeReferenceAlignment } from "./metrics";
import { getModelsFromLabels } from "../benchmarkModels";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { systemMessage } from "./runNlPromptResponseBenchmark";
>>>>>>> upstream/main

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
<<<<<<< HEAD
async function getTopQuestionDatasetDataset() {
  return initDataset(projectName, {
    apiKey: BRAINTRUST_API_KEY,
    dataset: datasetName,
  }).fetchedData() as unknown as NlPromptResponseEvalCase[];
}
=======
>>>>>>> upstream/main
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
<<<<<<< HEAD
        return await getTopQuestionDatasetDataset();
      },
    },
    product_knowledge: {
      description:
        "Product knowledge questions from MongoDB Product Maangement team",
      async getDataset() {
        return (await getTopQuestionDatasetDataset()).filter((d) =>
          d.tags.includes("product_knowledge")
        );
      },
    },
    tech_support: {
      description: "Tech support questions provided by Technical Services team",
      async getDataset() {
        return (await getTopQuestionDatasetDataset()).filter((d) =>
          d.tags.includes("tech_support")
        );
      },
    },
    marketing: {
      description: "Marketing questions provided by Marketing team",
      async getDataset() {
        return (await getTopQuestionDatasetDataset()).filter((d) =>
          d.tags.includes("marketing")
        );
      },
    },
    docs: {
      description: "100 questions from MongoDB Documentation team",
      async getDataset() {
        return (await getTopQuestionDatasetDataset()).filter((d) =>
          d.tags.includes("docs_100")
        );
=======
        return initDataset(projectName, {
          apiKey: BRAINTRUST_API_KEY,
          dataset: datasetName,
        }).fetchedData() as unknown as NlPromptResponseEvalCase[];
>>>>>>> upstream/main
      },
    },
  },

  tasks: {
    completion: {
      description: "Standard 1-shot completion task",
<<<<<<< HEAD
      taskFunc: (modelProvider, modelConfig) => {
        const model = wrapAISDKModel(
          createOpenAI({
            apiKey: modelProvider.apiKey,
            baseURL: modelProvider.baseUrl,
          }).chat(modelConfig.deployment)
        );
        return makeNlPromptCompletionTask({
          llmOptions: {
            temperature: 0,
          },
          languageModel: model,
=======
      taskFunc: (modelProvider: ModelProvider, deployment: string) => {
        return makeNlPromptCompletionTask({
          openAiClient: wrapOpenAI(
            new OpenAI({
              baseURL: modelProvider.baseUrl,
              apiKey: modelProvider.apiKey,
            })
          ),
          llmOptions: {
            model: deployment,
            temperature: 0,
          },
>>>>>>> upstream/main
          initialMessages: [systemMessage],
        });
      },
    },
  },

  scorers: {
    reference_alignment: {
      description: `Reference alignment scoring using judge model ${judgeModelConfig.label} (our rebrand of OpenAI's Factuality)`,
      scorerFunc: makeReferenceAlignment(
<<<<<<< HEAD
        {
          openAiClient: judgeOpenAiClient,
=======
        judgeOpenAiClient,
        {
>>>>>>> upstream/main
          model: judgeModelConfig.deployment,
          temperature: 0,
        },
        judgeModelConfig.label
      ),
    },
  },
};
