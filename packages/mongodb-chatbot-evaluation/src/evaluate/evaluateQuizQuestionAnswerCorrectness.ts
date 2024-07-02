import { EvaluateQualityFunc } from "./EvaluateQualityFunc";
import { QuizGeneratedData } from "../generate";
import { ObjectId, logger } from "mongodb-chatbot-server";
import { strict as assert } from "assert";
import { EvalResult } from "./EvaluationStore";

/**
  TODO
 */
export const evaluateQuizQuestionAnswerCorrectness: EvaluateQualityFunc =
  async function ({ runId, generatedData }) {
    assert(
      generatedData.type === "quiz",
      "Invalid data type. Expected 'quiz' data."
    );
    const quizData = generatedData as QuizGeneratedData;
    const {
      data: { modelAnswer },
      evalData: { questionText, answers },
    } = quizData;
    const correctAnswers = answers
      .filter((a) => a.isCorrect)
      .map((a) => a.label);
    let allCorrect = true;
    for (const answer of correctAnswers) {
      if (!modelAnswer.includes(answer)) {
        allCorrect = false;
        break;
      }
    }

    logger.info(
      `The response to '${questionText}' is ${
        allCorrect ? "'correct'" : "'incorrect'"
      }`
    );
    return {
      generatedDataId: generatedData._id,
      result: allCorrect ? 1 : 0,
      type: "quiz_correctness",
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: runId,
      metadata: {
        ...quizData.evalData,
        ...quizData.data,
      },
    } satisfies EvalResult;
  };
