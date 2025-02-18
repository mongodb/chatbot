import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { QuizQuestionData, QuizQuestionDataSchema } from "../QuizQuestionData";
import { makeTags } from "./makeTags";

const testDataPath = path.resolve(__dirname, "..", "..", "..", "testData");
const csvFileInPath = path.resolve(testDataPath, "badge-questions.csv");
const jsonFileOutPath = path.resolve(testDataPath, "badge-questions.json");

const parseCSV = async (filePath: string): Promise<QuizQuestionData[]> => {
  return new Promise((resolve, reject) => {
    const results: QuizQuestionData[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const answers = ["A", "B", "C", "D"].map((label, index) => ({
            answer: row[label],
            isCorrect: row.Answer === (index + 1).toString(),
            label,
          }));

          const questionData: QuizQuestionData = QuizQuestionDataSchema.parse({
            questionText: row["Question Text"],
            title: row["Assessment"],
            topicType: "badge", // Defaulting topic type
            questionType: "singleCorrect", // Assuming single correct answer
            answers,
            explanation: row["Reference"],
            tags: row["tags"] ? row["tags"].split(",") : [],
          });
          questionData.tags = makeTags(questionData);
          results.push(questionData);
        } catch (error) {
          console.error("Validation error:", error);
        }
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

(async () => {
  try {
    console.log("Parsing CSV file ", csvFileInPath);
    const quizQuestions = await parseCSV(csvFileInPath);
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
