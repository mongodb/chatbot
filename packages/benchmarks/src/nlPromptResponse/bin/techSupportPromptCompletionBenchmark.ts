import PromisePool from "@supercharge/promise-pool";
import {
  makeLlmOptions,
  MAX_CONCURRENT_EXPERIMENTS,
  MODELS,
  PROJECT_NAME,
} from "./config";
import { makeNlPromptCompletionTask } from "../nlPromptCompletionTask";
import { runNlPromptResponseEval } from "../NlQuestionAnswerEval";
import { wrapOpenAI } from "mongodb-rag-core/braintrust";
import { getOpenAiEndpointAndApiKey } from "mongodb-rag-core/models";
import { OpenAI } from "mongodb-rag-core/openai";
import { Factuality } from "../metrics";

async function main() {
  await PromisePool.for(MODELS)
    .withConcurrency(MAX_CONCURRENT_EXPERIMENTS)
    .process(async (model) => {
      const openAiClient = wrapOpenAI(
        new OpenAI({
          ...(await getOpenAiEndpointAndApiKey(model)),
        })
      );
      const llmOptions = { openAiClient, ...makeLlmOptions(model) };

      // TODO: update to use the makeExperimentName func when merged to main
      const experimentName = `tech-support-prompt-completion-${model.label}`;

      // TODO: will need to make factuality w/ the llm as a judge config
      const scorers = [Factuality];

      console.log(`Running experiment: ${experimentName}`);

      return runNlPromptResponseEval({
        data: [],
        projectName: PROJECT_NAME,
        experimentName,
        additionalMetadata: {},
        llmOptions,
        task: makeNlPromptCompletionTask({
          llmOptions,
        }),
        maxConcurrency: model.maxConcurrency,
        scorers,
      });
    });
}

main();
