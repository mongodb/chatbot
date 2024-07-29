import * as braintrust from "braintrust";
import {
  makeHelmQuizQuestionPrompt,
  QuizGeneratedData,
  quizQuestionToHelmAnswer,
  quizQuestionToHelmPrompt,
  SomeGeneratedData,
} from "mongodb-chatbot-evaluation";
import { PromisePool } from "@supercharge/promise-pool";
import assert from "assert";
export interface EvaluateRagConversationsParams {
  projectName: string;
  generatedData: SomeGeneratedData[];
  metadata?: Record<string, unknown>;
  description?: string;
  experimentName?: string;
}

export async function evaluateQuizQuestions({
  projectName,
  generatedData,
  metadata,
  description,
  experimentName,
}: EvaluateRagConversationsParams) {
  const experiment = braintrust.init(projectName, {
    metadata,
    description,
    experiment: experimentName,
  });

  await PromisePool.for(generatedData)
    .withConcurrency(10)
    .process(async (quizQuestion, index) => {
      console.log(`Running experiment ${index + 1}/${generatedData.length}`);
      await experiment.traced(async (span) => {
        const quizData = getQuizGeneratedData(quizQuestion);
        const output = quizData.data.modelAnswer
          // remove white space (for some reason, llama3-70b prepends '\n')
          .trim();
        const correctAnswer = quizQuestionToHelmAnswer(quizData.evalData);
        const CorrectQuizAnswer = output === correctAnswer ? 1 : 0;

        span.log({
          input: quizQuestionToHelmPrompt(quizData.evalData, false),
          output,
          expected: correctAnswer,
          scores: {
            CorrectQuizAnswer,
          },
          metadata: { ...quizData.evalData },
        });
      });
    });

  const summary = await experiment.summarize();
  console.log(summary);
  return summary;
}
function getQuizGeneratedData(generatedData: SomeGeneratedData) {
  assert(generatedData.type === "quiz", "Must be quiz data");
  return generatedData as QuizGeneratedData;
}
