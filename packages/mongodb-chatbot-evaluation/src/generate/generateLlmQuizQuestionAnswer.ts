import { QuizGeneratedData } from "./GeneratedDataStore";
import { ChatLlm, OpenAiChatMessage } from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { logger } from "mongodb-rag-core";
import { GenerateDataFunc } from "./GenerateDataFunc";
import {
  QuizQuestionTestCase,
  QuizQuestionTestCaseData,
  SomeTestCase,
  isQuizQuestionTestCase,
} from "./TestCase";
import { sleep } from "../utils/sleep";
import assert from "assert/strict";

export interface MakeGenerateQuizDataParams {
  /**
    Few-shot examples of quiz questions
    @example
    [
      {
        questionText: "What's the best Italian food?",
        answers: [
          { label: "A", answer: "Tacos", isCorrect: false },
          { label: "B", answer: "Pizza", isCorrect: true },
          { label: "C", answer: "Sushi", isCorrect: false },
          { label: "D", answer: "Enchiladas", isCorrect: false },
        ],
      },
    ]
   */
  quizQuestionExamples?: QuizQuestionTestCaseData[];

  /**
    Few words of the subject of the quiz questions. Included in the prompt.
    @example "Food"
   */
  subject?: string;

  /**
    The large language model to use for generating conversation data.
   */
  chatLlm: ChatLlm;

  /**
    The name of the language model to use for generating the quiz question answers.
   */
  modelName: string;

  /**
    Number of milliseconds to sleep between each conversation generation.
    Helpful for rate limiting.
   */
  sleepMs?: number;
}

/**
  Generate answer to multiple-choice quiz questions using a large language model (LLM).

  This can be useful for evaluating how an LLM performance on the subject matter of the multiple choice questions.

  The prompt is based on this blog post from Hugging Face: https://huggingface.co/blog/open-llm-leaderboard-mmlu
  It follows the [HELM prompt format](https://huggingface.co/blog/open-llm-leaderboard-mmlu#mmlu-comes-in-all-shapes-and-sizes-looking-at-the-prompts).

  You can optionally include examples for [few-shot prompting](https://www.promptingguide.ai/techniques/fewshot) for consistent model output.
 */
export const makeGenerateLlmQuizQuestionAnswer = function ({
  quizQuestionExamples,
  subject,
  chatLlm,
  modelName,
  sleepMs = 0,
}: MakeGenerateQuizDataParams): GenerateDataFunc {
  return async function ({
    testCases,
    runId,
  }: {
    testCases: SomeTestCase[];
    runId: ObjectId;
  }): Promise<{
    generatedData: QuizGeneratedData[];
    failedCases: QuizQuestionTestCase[];
  }> {
    const quizTestCases = testCases.filter(
      (testCase): testCase is QuizQuestionTestCase =>
        isQuizQuestionTestCase(testCase)
    );

    const generatedData: QuizGeneratedData[] = [];
    const failedCases: QuizQuestionTestCase[] = [];
    for (const testCase of quizTestCases) {
      logger.info(
        `Generating data for test case: '${testCase.data.questionText}'`
      );

      const promptMessages = makeHelmQuizQuestionPrompt({
        quizQuestion: testCase.data,
        quizQuestionExamples,
        subject,
      });

      try {
        const response = await chatLlm.answerQuestionAwaited({
          messages: promptMessages,
        });
        assert(response.content, "No response content from LLM");

        generatedData.push({
          _id: new ObjectId(),
          commandRunId: runId,
          data: {
            modelAnswer: response.content,
          },
          type: "quiz",
          evalData: { ...testCase.data, promptMessages, modelName },
          createdAt: new Date(),
        });
      } catch (e) {
        logger.error(
          `Failed to generate data for test case: '${testCase.data.questionText}'`
        );
        failedCases.push(testCase);
      }
      await sleep(sleepMs);
    }

    return { generatedData, failedCases };
  };
};

/**
  Create a HELM-style quiz question prompt string.
  @example Without answer:
  ```txt
  Question: What is the recommended maximum number of collections for an M10 cluster? (Select one.)
  A. 100,000
  B. 10,000
  C. 20,000
  D. 5,000
  Response:
  ```
  @example With answer:
  ```txt
  Question: What is the recommended maximum number of collections for an M10 cluster? (Select one.)
  A. 100,000
  B. 10,000
  C. 20,000
  D. 5,000
  Response: B
  ```
 */
export function quizQuestionToHelmPrompt(
  quizQuestion: QuizQuestionTestCaseData,
  includeAnswer: boolean
): string {
  return `Question: ${quizQuestion.questionText}
${quizQuestion.answers
  .map((answer) => `${answer.label}. ${answer.answer}`)
  .join("\n")}
Response: ${includeAnswer ? quizQuestionToHelmAnswer(quizQuestion) : ""}`;
}

/**
  Accepts a quiz question and formats the correct answer as a string.
  Separates multiple correct answers by commas without spaces.
  Sorts multiple correct answers in ascending order.
  @example
  A only correct answer -> "A"
  @example
  B and D correct answers -> "B,D"

 */
export function quizQuestionToHelmAnswer(
  quizQuestion: QuizQuestionTestCaseData
) {
  return (
    quizQuestion.answers
      .filter((ans) => ans.isCorrect)
      .map((answer) => answer.label)
      // Sort alphabetical, ascending
      .sort()
      .join(",")
  );
}
/**
  Generate prompt for multiple-choice quiz questions using a large language model (LLM).

  This can be useful for evaluating how an LLM performs on the subject matter of the multiple choice questions.

  The prompt is based on this blog post from Hugging Face: https://huggingface.co/blog/open-llm-leaderboard-mmlu
  It follows the [HELM prompt format](https://huggingface.co/blog/open-llm-leaderboard-mmlu#mmlu-comes-in-all-shapes-and-sizes-looking-at-the-prompts).

  You can optionally include examples for [few-shot prompting](https://www.promptingguide.ai/techniques/fewshot) for consistent model output.
 */
export function makeHelmQuizQuestionPrompt({
  quizQuestionExamples,
  quizQuestion,
  subject,
}: {
  /**
    Few-shot examples to show the model how to respond.
   */
  quizQuestionExamples?: QuizQuestionTestCaseData[];
  /**
    Few words of the subject of the quiz questions.
    Included in the prompt
   */
  subject?: string;
  /**
    Quiz question to generate a prompt for.
   */
  quizQuestion: QuizQuestionTestCaseData;
}): OpenAiChatMessage[] {
  const promptMessages: OpenAiChatMessage[] = [];
  const systemPromptContent = `The following are multiple choice questions (with answers)${
    subject ? ` about ${subject}` : ""
  }.
Only provide the answer the final question using the exact same format as the previous questions. Just provide the letters, e.g. A,B,C,D`;
  const systemPrompt = {
    role: "system",
    content: systemPromptContent,
  } satisfies OpenAiChatMessage;
  const fewShotExamples = quizQuestionExamples?.map(
    (quizQuestionExample) =>
      [
        {
          role: "user",
          content: quizQuestionToHelmPrompt(quizQuestionExample, false),
        },
        {
          role: "assistant",
          content: quizQuestionToHelmAnswer(quizQuestionExample),
        },
      ] satisfies OpenAiChatMessage[]
  );
  const currentQuestion = {
    role: "user",
    content: quizQuestionToHelmPrompt(quizQuestion, false),
  } satisfies OpenAiChatMessage;
  promptMessages.push(
    systemPrompt,
    ...(fewShotExamples?.flat() ?? []),
    currentQuestion
  );
  return promptMessages;
}
