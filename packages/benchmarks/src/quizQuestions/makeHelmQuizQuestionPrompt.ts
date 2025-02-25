import { OpenAI } from "mongodb-rag-core/openai";
import { QuizQuestionData } from "./QuizQuestionData";

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

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
  quizQuestion: QuizQuestionData,
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
export function quizQuestionToHelmAnswer(quizQuestion: QuizQuestionData) {
  return (
    quizQuestion.answers
      .filter((ans) => ans.isCorrect)
      .map((answer) => answer.label)
      // Sort alphabetical, ascending
      .sort()
      .join(",")
  );
}

export interface MakeHelmQuizQuestionPromptParams {
  /**
      Few-shot examples to show the model how to respond.
     */
  quizQuestionExamples?: QuizQuestionData[];
  /**
      Few words of the subject of the quiz questions.
      Included in the prompt
     */
  subject?: string;
  /**
      Quiz question to generate a prompt for.
     */
  quizQuestion: QuizQuestionData;
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
}: MakeHelmQuizQuestionPromptParams): ChatMessage[] {
  const promptMessages: ChatMessage[] = [];
  const systemPromptContent = `The following are multiple choice questions (with answers)${
    subject ? ` about ${subject}` : ""
  }.
Only provide the answer the final question using the exact same format as the previous questions. Just provide the letters, e.g. A,B,C,D`;
  const systemPrompt = {
    role: "system",
    content: systemPromptContent,
  } satisfies ChatMessage;
  const fewShotExamples = quizQuestionExamples
    ?.filter((quizQuestionExample) => {
      // if single correct, only include examples with one correct answer
      if (quizQuestion.questionType === "singleCorrect") {
        return (
          quizQuestionExample.answers?.filter((answer) => answer.isCorrect)
            .length === 1
        );
      }

      // if multiple correct, include all examples
      return true;
    })
    ?.map(
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
        ] satisfies ChatMessage[]
    );

  const currentQuestion = {
    role: "user",
    content: quizQuestionToHelmPrompt(quizQuestion, false),
  } satisfies ChatMessage;
  promptMessages.push(
    systemPrompt,
    ...(fewShotExamples?.flat() ?? []),
    currentQuestion
  );
  return promptMessages;
}
