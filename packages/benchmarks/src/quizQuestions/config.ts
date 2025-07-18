import { wrapOpenAI } from "mongodb-rag-core/braintrust";
import { BenchmarkConfig, ModelProvider } from "../cli/BenchmarkConfig";
import { getQuizQuestionEvalCasesFromBraintrust } from "./getQuizQuestionEvalCasesFromBraintrust";
import {
  QuizQuestionEvalCaseInput,
  QuizQuestionTaskOutput,
  QuizQuestionTaskExpected,
  CorrectQuizAnswer,
  makeQuizQuestionTask,
} from "./QuizQuestionEval";
import { OpenAI } from "mongodb-rag-core/openai";
import { mongoDbQuizQuestionExamples } from "./mongoDbQuizQuestionExamples";

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
  },
  tasks: {
    answer_question: {
      description: "Answer multiple choice questions about MongoDB",
      taskFunc: (modelProvider: ModelProvider, deployment: string) => {
        const openaiClient = wrapOpenAI(
          new OpenAI({
            baseURL: modelProvider.baseUrl,
            apiKey: modelProvider.apiKey,
          })
        );
        const promptOptions = {
          subject: "MongoDB",
          quizQuestionExamples: mongoDbQuizQuestionExamples,
        };
        const llmOptions = {
          max_tokens: deployment.includes("gemini-2.5") ? undefined : 100,
          reasoning_enabled: deployment.includes("gemini-2.5")
            ? true
            : undefined,
          reasoning_budget: deployment.includes("gemini-2.5")
            ? 1024
            : undefined,
        };
        return makeQuizQuestionTask({
          openaiClient,
          model: deployment,
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
