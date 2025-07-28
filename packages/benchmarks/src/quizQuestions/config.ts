import { BenchmarkConfig } from "../cli/BenchmarkConfig";
import { getQuizQuestionEvalCasesFromBraintrust } from "./getQuizQuestionEvalCasesFromBraintrust";
import {
  QuizQuestionEvalCaseInput,
  QuizQuestionTaskOutput,
  QuizQuestionTaskExpected,
  CorrectQuizAnswer,
  makeQuizQuestionTask,
} from "./QuizQuestionEval";
import { mongoDbQuizQuestionExamples } from "./mongoDbQuizQuestionExamples";
import { wrapAISDKModel } from "mongodb-rag-core/braintrust";
import { createOpenAI } from "mongodb-rag-core/aiSdk";

export const projectName = "mongodb-multiple-choice";
export const datasetName = "university-quiz-badge-questions";

export const multipleChoiceBenchmarkConfig: BenchmarkConfig<
  QuizQuestionEvalCaseInput,
  QuizQuestionTaskOutput,
  QuizQuestionTaskExpected,
  void
> = {
  projectName,
  datasets: {
    mdbu_quiz_all: {
      description: "All MongoDB University quiz questions",
      getDataset: async () => {
        return await getQuizQuestionEvalCasesFromBraintrust({
          projectName,
          datasetName,
        });
      },
    },
    mdbu_quiz_badge: {
      description: "Badge MongoDB University quiz questions",
      getDataset: async () => {
        return (
          (
            await getQuizQuestionEvalCasesFromBraintrust({
              projectName,
              datasetName,
            })
          )
            // Filter to only look at 'badge' questions here
            .filter((d) => d.tags?.includes("badge"))
        );
      },
    },
  },
  tasks: {
    answer_question: {
      description: "Answer multiple choice questions about MongoDB",
      taskFunc: (modelProvider, modelConfig) => {
        const model = wrapAISDKModel(
          createOpenAI({
            apiKey: modelProvider.apiKey,
            baseURL: modelProvider.baseUrl,
          }).chat(modelConfig.deployment)
        );
        const promptOptions = {
          subject: "MongoDB",
          quizQuestionExamples: mongoDbQuizQuestionExamples,
        };
        const llmOptions = {
          max_tokens: modelConfig.reasoning ? undefined : 100,
          reasoning_enabled: modelConfig.reasoning ? true : undefined,
          reasoning_budget: modelConfig.reasoning ? 1024 : undefined,
        };
        return makeQuizQuestionTask({
          languageModel: model,
          llmOptions,
          promptOptions,
        });
      },
    },
  },
  scorers: {
    correct_answer: {
      scorerFunc: CorrectQuizAnswer,
      description: "Checks if the answer matches the expected correct answer",
    },
  },
  description: "Multiple choice questions (MMLU style)",
};
