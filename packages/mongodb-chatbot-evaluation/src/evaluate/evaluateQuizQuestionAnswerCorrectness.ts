import { EvaluateQualityFunc } from "./EvaluateQualityFunc";
import { QuizGeneratedData, quizQuestionToHelmAnswer } from "../generate";
import { logger } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { strict as assert } from "assert";
import { EvalResult } from "./EvaluationStore";

/**
  Evaluate if the response to a multiple-choice quiz question is correct.
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
      evalData,
    } = quizData;
    const allCorrect = modelAnswer === quizQuestionToHelmAnswer(evalData);

    logger.info(
      `The response to '${evalData.questionText}' is ${
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
