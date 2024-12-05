import { QuizQuestionData } from "./QuizQuestionData";
import {
  makeHelmQuizQuestionPrompt,
  quizQuestionToHelmPrompt,
} from "./makeHelmQuizQuestionPrompt";

const subject = "food";

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
});
