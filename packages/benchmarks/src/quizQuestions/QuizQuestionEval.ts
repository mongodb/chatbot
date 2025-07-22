import {
  Eval,
  EvalCase,
  EvalScorer,
  EvalTask,
} from "mongodb-rag-core/braintrust";
import { OpenAI } from "mongodb-rag-core/openai";
import { QuizQuestionData } from "./QuizQuestionData";
import { strict as assert } from "assert";
import {
  makeHelmQuizQuestionPrompt,
  MakeHelmQuizQuestionPromptParams,
} from "./makeHelmQuizQuestionPrompt";
import { CoreMessage, generateText, LanguageModel } from "ai";

export type QuizQuestionEvalCaseInput = Pick<
  QuizQuestionData,
  "questionText" | "answers" | "questionType"
>;

export type QuizQuestionTag = string;

export type QuizQuestionMetadata = Pick<
  QuizQuestionData,
  "contentTitle" | "explanation" | "title"
>;

export interface QuizQuestionEvalCase
  extends EvalCase<
    QuizQuestionEvalCaseInput,
    QuizQuestionTaskExpected,
    QuizQuestionMetadata
  > {
  tags?: QuizQuestionTag[];
}

export type QuizQuestionTaskOutput = string;

export type QuizQuestionTaskExpected = string;

export type QuizQuestionEvalTask = EvalTask<
  QuizQuestionEvalCaseInput,
  QuizQuestionTaskOutput,
  QuizQuestionTaskExpected
>;

interface MakeQuizQuestionTaskParams {
  languageModel: LanguageModel;
  llmOptions: QuizQuestionLlmOptions;
  promptOptions: QuizQuestionPromptOptions;
}

export function makeQuizQuestionTask({
<<<<<<< HEAD
  languageModel,
=======
  openaiClient,
  model,
>>>>>>> upstream/main
  llmOptions,
  promptOptions,
}: MakeQuizQuestionTaskParams): QuizQuestionEvalTask {
  return async function (input) {
    const promptMessages = makeHelmQuizQuestionPrompt({
      quizQuestion: input,
      ...promptOptions,
    }) satisfies CoreMessage[];
    const { text } = await generateText({
      model: languageModel,
      messages: promptMessages,
      ...llmOptions,
      temperature: 0,
    });
    assert(text, "No content found in response");
    return text;
  };
}

export type QuizQuestionEvalScorer = EvalScorer<
  QuizQuestionEvalCaseInput,
  QuizQuestionTaskOutput,
  QuizQuestionTaskExpected,
  void
>;

export const CorrectQuizAnswer: QuizQuestionEvalScorer = function (args) {
  const score =
    normalizeAnswer(args.expected) === normalizeAnswer(args.output) ? 1 : 0;
  return {
    name: `CorrectQuizAnswer`,
    score,
  };
};

function normalizeAnswer(answer: string) {
  return answer
    .split(",")
    .map((el) => el.trim())
    .join(",")
    .toUpperCase();
}

type QuizQuestionLlmOptions = Pick<
  OpenAI.ChatCompletionCreateParams,
  "max_tokens" & "reasoning_budget" & "reasoning_enabled"
>;

type QuizQuestionPromptOptions = Omit<
  MakeHelmQuizQuestionPromptParams,
  "quizQuestion"
>;

export interface MakeQuizQuestionEvalParams {
  data: QuizQuestionEvalCase[];
  projectName: string;
  experimentName: string;
  llmOptions?: QuizQuestionLlmOptions;
  promptOptions: QuizQuestionPromptOptions;
  additionalMetadata?: Record<string, unknown>;
  languageModel: LanguageModel;
  maxConcurrency?: number;
}

export function runQuizQuestionEval({
  data,
  projectName,
  experimentName,
  additionalMetadata,
  languageModel,
  llmOptions,
  promptOptions,
  maxConcurrency,
}: MakeQuizQuestionEvalParams) {
  const reasoningOptions = {
    max_tokens: languageModel.modelId.includes("gemini-2.5") ? undefined : 100,
    reasoning_enabled: languageModel.modelId.includes("gemini-2.5")
      ? true
      : undefined,
    reasoning_budget: languageModel.modelId.includes("gemini-2.5")
      ? 1024
      : undefined,
  };

  llmOptions = {
    ...reasoningOptions,
    ...(llmOptions ?? {}),
  };

  return Eval<
    QuizQuestionEvalCaseInput,
    QuizQuestionTaskOutput,
    QuizQuestionTaskExpected
  >(projectName, {
    data,
    experimentName,
    maxConcurrency,
    metadata: {
      model: languageModel.modelId,
      llmOptions,
      ...additionalMetadata,
    },
    task: makeQuizQuestionTask({
      languageModel,
      llmOptions,
      promptOptions,
    }),
    scores: [CorrectQuizAnswer],
  });
}
