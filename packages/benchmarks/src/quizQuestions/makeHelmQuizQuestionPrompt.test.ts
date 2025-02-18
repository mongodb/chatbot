import { QuizQuestionData } from "./QuizQuestionData";
import {
  makeHelmQuizQuestionPrompt,
  quizQuestionToHelmPrompt,
} from "./makeHelmQuizQuestionPrompt";

const subject = "food";

const testQuestion = {
  contentTitle: "Best foods",
  title: "Best foods",
  topicType: "quiz",
  questionType: "multipleCorrect",
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
      isCorrect: true,
      label: "C",
    },
    {
      answer: "Enchiladas",
      isCorrect: false,
      label: "D",
    },
  ],
} satisfies QuizQuestionData;

const testQuestionSingleCorrect = {
  contentTitle: "Best foods",
  title: "Best foods",
  topicType: "quiz",
  questionType: "singleCorrect",
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
} satisfies QuizQuestionData;

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
      (promptWithSubject[0].content as string).startsWith(
        `The following are multiple choice questions (with answers) about ${subject}.`
      )
    ).toBe(true);

    const promptWithoutSubject = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
    });
    expect(
      (promptWithoutSubject[0].content as string).startsWith(
        "The following are multiple choice questions (with answers)."
      )
    ).toBe(true);
  });
  it("should include few-shot examples", () => {
    const prompt = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestion,
      quizQuestionExamples: [testQuestion],
      subject,
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
      {
        content: expect.any(String),
        role: "assistant",
      },
      {
        content: expect.any(String),
        role: "user",
      },
    ]);
  });
  it("should only include examples with one correct answer for topicType=singleCorrect questions", () => {
    const prompt = makeHelmQuizQuestionPrompt({
      quizQuestion: testQuestionSingleCorrect,
      quizQuestionExamples: [
        {
          ...testQuestion,
          answers: [
            ...testQuestion.answers,
            {
              answer: "Pasta",
              isCorrect: true,
              label: "E",
            },
          ],
        },
        testQuestionSingleCorrect,
      ],
      subject,
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
      {
        content: expect.any(String),
        role: "assistant",
      },
      {
        content: expect.any(String),
        role: "user",
      },
    ]);
  });
});
