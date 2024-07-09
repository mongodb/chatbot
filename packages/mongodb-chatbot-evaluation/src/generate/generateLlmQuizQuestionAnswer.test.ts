import { makeLangchainChatLlm, ObjectId } from "mongodb-chatbot-server";
import {
  makeGenerateLlmQuizQuestionAnswer,
  makeHelmQuizQuestionPrompt,
  quizQuestionToHelmPrompt,
} from "./generateLlmQuizQuestionAnswer";
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
    expect(prompt).toMatchObject({
      content: expect.any(String),
      role: "user",
    });
  });
  it("should conditionally interpolate the subject", () => {
    const promptWithSubject = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
      subject,
    });
    expect(
      promptWithSubject.content.startsWith(
        `The following are multiple choice questions (with answers) about ${subject}.`
      )
    ).toBe(true);

    const promptWithoutSubject = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
    });
    expect(
      promptWithoutSubject.content.startsWith(
        "The following are multiple choice questions (with answers)."
      )
    ).toBe(true);
  });
  it("should include the correct role", () => {
    const userPrompt = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
    });
    expect(userPrompt.role).toBe("user");
    const systemPrompt = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
      messageRole: "system",
    });
    expect(systemPrompt.role).toBe("system");
  });
  it("should correctly interpolate the examples", () => {
    const promptNoExamples = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
    });
    console.log(promptNoExamples.content);
    const noExamplesExpectation = `The following are multiple choice questions (with answers).
Only provide the answer the final question using the exact same format as the previous questions. Just provide the letters, e.g. A,B,C,D

${quizQuestionToHelmPrompt(testQuestion, false)}`;
    expect(promptNoExamples.content).toMatch(noExamplesExpectation);
    const examplesExpectation = `The following are multiple choice questions (with answers).
Only provide the answer the final question using the exact same format as the previous questions. Just provide the letters, e.g. A,B,C,D

${quizQuestionExamples
  .map((example) => quizQuestionToHelmPrompt(example, true))
  .join("\n\n")}

${quizQuestionToHelmPrompt(testQuestion, false)}`;
    const promptWithExamples = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
      quizQuestionExamples,
    });
    expect(promptWithExamples.content).toMatch(examplesExpectation);
  });
});
