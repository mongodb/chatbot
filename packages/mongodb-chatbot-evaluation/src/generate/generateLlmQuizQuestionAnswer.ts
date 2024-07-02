import { QuizGeneratedData } from "./GeneratedDataStore";
import { ChatLlm, ObjectId, UserMessage } from "mongodb-chatbot-server";
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

      const prompt = makeQuizQuestionPrompt({
        quizQuestionExamples,
        quizQuestion: testCase.data,
        subject,
      });

      try {
        const response = await chatLlm.answerQuestionAwaited({
          messages: [prompt],
        });
        assert(response.content, "No response content from LLM");

        generatedData.push({
          _id: new ObjectId(),
          commandRunId: runId,
          data: {
            modelAnswer: response.content,
          },
          type: "quiz",
          evalData: { ...testCase.data, prompt, modelName },
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

function quizQuestionToPrompt(
  quizQuestion: QuizQuestionTestCaseData,
  includeAnswer: boolean
): string {
  return `Question: ${quizQuestion.questionText}
${quizQuestion.answers
  .map((answer) => `${answer.label}. ${answer.answer}`)
  .join("\n")}
Response:
${
  includeAnswer
    ? quizQuestion.answers.map((answer) => answer.label).join(",")
    : ""
}`.trim();
}
function makeQuizQuestionPrompt({
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
   */
  subject?: string;
  /**
    Quiz question to generate a prompt for.
   */
  quizQuestion: QuizQuestionTestCaseData;
}): UserMessage {
  const content = `The following are multiple choice questions (with answers)${
    subject ? ` about ${subject}` : ""
  }.
Only provide the answer the final question using the exact same format as the previous questions. Just provide the letters, e.g. A,B,C,D

${quizQuestionExamples
  ?.map((example) => quizQuestionToPrompt(example, true))
  .join("\n\n")}

${quizQuestionToPrompt(quizQuestion, false)}`;
  return {
    content,
    role: "user",
  };
}
