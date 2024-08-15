import { makeLangchainChatLlm, ObjectId } from "mongodb-chatbot-server";
import {
  makeGenerateLlmQuizQuestionAnswer,
  makeHelmQuizQuestionPrompt,
  quizQuestionToHelmPrompt,
} from "./generateLlmQuizQuestionAnswer";
import { FakeListChatModel } from "@langchain/core/utils/testing";
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
    expect(generated.evalData?.promptMessages[0]?.content).toMatch(
      new RegExp(subject)
    );
  });
  it("should include few-shot examples in the system prompt", async () => {
    // (1 system prompt)
    // + (2 for each example, user and assistant messages)
    // + (1 user message for actual message)
    const expectedLength = 1 + quizQuestionExamples.length * 2 + 1;
    expect(generated.evalData?.promptMessages).toHaveLength(expectedLength);
    expect(generated.evalData?.promptMessages[1].content).toMatch(
      new RegExp(quizQuestionExamples[0].questionText)
    );
  });
  it("should include quiz question in the system prompt", () => {
    expect(
      generated.evalData?.promptMessages.at(-1).content
    ).toMatch(new RegExp(testQuestion.questionText));
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
        promptMessages: makeHelmQuizQuestionPrompt({
          quizQuestion: testQuestion,
          quizQuestionExamples,
          subject,
        }),
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

describe("quizQuestionToHelmPrompt", () => {
  it("should generate a quiz question string", () => {
    const prompt = quizQuestionToHelmPrompt(testQuestion, false);
    expect(prompt).toMatch(
      `What's the best Italian food?
A. Tacos
B. Pizza
C. Sushi
D. Enchiladas
Response:`
    );
  });
  it("should include the answer when `includeAnswer: true`", () => {
    const prompt = quizQuestionToHelmPrompt(testQuestion, true);
    expect(prompt).toMatch(
      `What's the best Italian food?
A. Tacos
B. Pizza
C. Sushi
D. Enchiladas
Response: B`
    );
  });
  it("should not include the answer when `includeAnswer: false`", () => {
    const prompt = quizQuestionToHelmPrompt(testQuestion, false);
    expect(prompt).toMatch(
      `What's the best Italian food?
A. Tacos
B. Pizza
C. Sushi
D. Enchiladas
Response: `
    );
  });
});
describe("makeHelmQuizQuestionPrompt", () => {
  it("should generate a prompt", () => {
    const prompt = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
    });
    expect(prompt).toMatchObject([
      {
        role: "system",
        content: expect.any(String),
      },
      {
        content: expect.any(String),
        role: "user",
      },
    ]);
  });
  it("should conditionally interpolate the subject", () => {
    const promptWithSubject = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
      subject,
    });
    expect(
      promptWithSubject[0].content?.startsWith(
        `The following are multiple choice questions (with answers) about ${subject}.`
      )
    ).toBe(true);

    const promptWithoutSubject = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
    });
    expect(
      promptWithoutSubject[0].content?.startsWith(
        "The following are multiple choice questions (with answers)."
      )
    ).toBe(true);
  });
});
