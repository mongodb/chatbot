import fs from "fs";
import path from "path";
import { QuizQuestionData, QuizQuestionDataSchema } from "../QuizQuestionData";
import { makeTags } from "./makeTags";
const testDataPath = path.resolve(__dirname, "..", "..", "..", "testData");
const fileInPath = path.resolve(testDataPath, "university-quiz-questions.json");
const jsonFileOutPath = path.resolve(
  testDataPath,
  "university-quiz-questions-annotated.json"
);

/**
   Add metadata such as tags and the correct question type to previous quiz questions.
 */
const augmentJson = (filePath: string): QuizQuestionData[] => {
  const results: QuizQuestionData[] = [];
  const qqs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  for (const qq of qqs) {
    const quizQuestion = qq.input as QuizQuestionData;
    quizQuestion.questionType = "multipleCorrect";
    quizQuestion.tags = makeTags(quizQuestion);
    results.push(quizQuestion);
  }
  return results.map(
    (qq) => QuizQuestionDataSchema.parse(qq) satisfies QuizQuestionData
  );
};

(() => {
  try {
    console.log("Parsing file in ", fileInPath);
    const quizQuestions = augmentJson(fileInPath);
    fs.writeFileSync(
      jsonFileOutPath,
      JSON.stringify(quizQuestions, null, 2),
      "utf-8"
    );
    console.log("Quiz questions written to ", jsonFileOutPath);
  } catch (error) {
    console.error("Error parsing CSV:", error);
  }
})();
