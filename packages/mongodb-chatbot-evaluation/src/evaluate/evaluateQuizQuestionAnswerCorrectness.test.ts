import { ObjectId } from "mongodb-rag-core";
import { evaluateQuizQuestionAnswerCorrectness } from "./evaluateQuizQuestionAnswerCorrectness";
import { QuizGeneratedData } from "../generate";

describe("evaluateQuizQuestionAnswerCorrectness", () => {
  const runId = new ObjectId();
  const modelName = "model name";
  test("should evaluate that response is correct (1 correct answer)", async () => {
    await evaluateQuizGeneratedData(
      runId,
      "A",
      [
        {
          answer: "answer",
          label: "A",
          isCorrect: true,
        },
        {
          answer: "answer",
          label: "B",
          isCorrect: false,
        },
        {
          answer: "answer",
          label: "C",
          isCorrect: false,
        },
      ],
      1
    );
  });
  test("should evaluate that response is correct (multiple correct answers)", async () => {
    await evaluateQuizGeneratedData(
      runId,
      "A,B",
      [
        {
          answer: "answer",
          label: "A",
          isCorrect: true,
        },
        {
          answer: "answer",
          label: "B",
          isCorrect: true,
        },
        {
          answer: "answer",
          label: "C",
          isCorrect: false,
        },
      ],
      1
    );
  });
  test("should evaluate that response is incorrect (partial correct)", async () => {
    await evaluateQuizGeneratedData(
      runId,
      "A",
      [
        {
          answer: "answer",
          label: "A",
          isCorrect: true,
        },
        {
          answer: "answer",
          label: "B",
          isCorrect: true,
        },
        {
          answer: "answer",
          label: "C",
          isCorrect: false,
        },
      ],
      0
    );
  });
  test("should evaluate that response is incorrect (fully incorrect)", async () => {
    await evaluateQuizGeneratedData(
      runId,
      "C",
      [
        {
          answer: "answer",
          label: "A",
          isCorrect: true,
        },
        {
          answer: "answer",
          label: "B",
          isCorrect: true,
        },
        {
          answer: "answer",
          label: "C",
          isCorrect: false,
        },
      ],
      0
    );
  });
});

async function evaluateQuizGeneratedData(
  runId: ObjectId,
  modelAnswer: string,
  answers: QuizGeneratedData["evalData"]["answers"],
  result: 0 | 1
) {
  const generatedData = {
    _id: new ObjectId(),
    commandRunId: runId,
    type: "quiz",
    data: {
      modelAnswer,
    },
    evalData: {
      questionText: "question text",
      contentTitle: "content title",
      prompt: {
        content: "prompt content",
        role: "user",
      },
      questionType: "question type",
      title: "title",
      topicType: "topic type",
      answers,
      modelName: "model name",
    },
    createdAt: new Date(),
  } satisfies QuizGeneratedData;
  const evalResult = await evaluateQuizQuestionAnswerCorrectness({
    runId,
    generatedData,
  });
  expect(evalResult).toMatchObject({
    generatedDataId: generatedData._id,
    result,
    type: "quiz_correctness",
    _id: expect.any(ObjectId),
    createdAt: expect.any(Date),
    commandRunMetadataId: runId,
    metadata: {
      ...generatedData.evalData,
      ...generatedData.data,
    },
  });
}
