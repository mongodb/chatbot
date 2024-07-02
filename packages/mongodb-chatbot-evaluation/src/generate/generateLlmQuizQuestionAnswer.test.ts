import { makeLangchainChatLlm, ObjectId } from "mongodb-chatbot-server";
import { makeGenerateLlmQuizQuestionAnswer } from "./generateLlmQuizQuestionAnswer";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { QuizQuestionTestCaseData } from "./TestCase";
import { QuizGeneratedData } from "./GeneratedDataStore";

const subject = "Food";
const quizQuestionExamples = [
  {
    contentTitle: "Best foods",
    title: "Best foods",
    topicType: "food",
    questionType: "multiple_choice",
    questionText: "What's the best Italian food?",
    answers: [
      {
        answer: "Tacos",
        isCorrect: true,
        label: "A",
      },
      {
        answer: "Pizza",
        isCorrect: false,
        label: "B",
      },
      {
        answer: "Sushi",
        isCorrect: false,
        label: "C",
      },
      {
        answer: "Enchiladas",
        isCorrect: false,
        label: "D",
      },
    ],
  },
] satisfies QuizQuestionTestCaseData[];
const testQuestion = {
  contentTitle: "Best foods",
  title: "Best foods",
  topicType: "food",
  questionType: "multiple_choice",
  questionText: "What's the best Italian food?",
  answers: [
    {
      answer: "Tacos",
      isCorrect: false,
      label: "A",
    },
    {
      answer: "Pizza",
      isCorrect: true,
      label: "B",
    },
    {
      answer: "Sushi",
      isCorrect: false,
      label: "C",
    },
    {
      answer: "Enchiladas",
      isCorrect: false,
      label: "D",
    },
  ],
} satisfies QuizQuestionTestCaseData;

const modelAnswer = "A";
const chatLlm = makeLangchainChatLlm({
  chatModel: new FakeListChatModel({
    responses: [modelAnswer],
  }),
});
const modelName = "test";
describe("generateLlmQuizQuestionAnswer", () => {
  const genQuizQuestions = makeGenerateLlmQuizQuestionAnswer({
    subject,
    quizQuestionExamples,
    chatLlm,
    modelName,
  });
  const runId = new ObjectId();
  let generated: QuizGeneratedData;
  beforeAll(async () => {
    const { generatedData } = await genQuizQuestions({
      runId,
      testCases: [
        {
          name: "quiz",
          data: testQuestion,
        },
      ],
    });
    generated = generatedData[0] as QuizGeneratedData;
  });
  it("should return the expected data", async () => {
    expect(generated).toMatchObject({
      type: "quiz",
      data: {
        modelAnswer,
      },
    });
  });
  it("should include subject in the system prompt", async () => {
    expect(generated.evalData?.prompt.content).toMatch(new RegExp(subject));
  });
  it("should include few-shot examples in the system prompt", async () => {
    expect(generated.evalData?.prompt.content).toMatch(
      new RegExp(quizQuestionExamples[0].questionText)
    );
  });
  it("should include quiz question in the system prompt", () => {
    expect(generated.evalData?.prompt.content).toMatch(
      new RegExp(testQuestion.questionText)
    );
  });
  it("should generate data for quiz question", () => {
    expect(generated).toMatchObject({
      _id: expect.any(ObjectId),
      commandRunId: runId,
      type: "quiz",
      data: {
        modelAnswer,
      },
      evalData: {
        ...testQuestion,
        prompt: {
          role: "user",
          content: expect.any(String),
        },
        modelName,
      },
    } satisfies Partial<QuizGeneratedData>);
  });
  it("should handle failed generations", async () => {
    const brokenChatLlm = makeLangchainChatLlm({
      chatModel: new FakeListChatModel({
        responses: [""],
      }),
    });
    const genQuizQuestions = makeGenerateLlmQuizQuestionAnswer({
      subject,
      quizQuestionExamples,
      chatLlm: brokenChatLlm,
      modelName,
    });
    const { failedCases } = await genQuizQuestions({
      runId,
      testCases: [
        {
          name: "quiz",
          data: testQuestion,
        },
      ],
    });
    expect(failedCases).toHaveLength(1);
  });
});
