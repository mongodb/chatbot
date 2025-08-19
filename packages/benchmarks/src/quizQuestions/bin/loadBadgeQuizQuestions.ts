import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { QuizQuestionData, QuizQuestionDataSchema } from "../QuizQuestionData";

const testDataPath = path.resolve(__dirname, "..", "..", "..", "testData");
const csvFileInPath = path.resolve(testDataPath, "badge-questions.csv");
const jsonFileOutPath = path.resolve(testDataPath, "badge-questions.json");

const handleAnswers = (row: any) => {
  const correctAnswers = row.Answer.trim()?.split("") || [];
  const answers = ["A", "B", "C", "D", "E", "F"]
    .map((label) => {
      const isCorrect = correctAnswers.includes(label);
      return {
        answer: row[label],
        isCorrect,
        label,
      };
    })
    .filter((answer) => answer.answer && answer.answer.trim() !== ""); // Remove empty answers
  return answers;
};

const parseCSV = async (filePath: string): Promise<QuizQuestionData[]> => {
  return new Promise((resolve, reject) => {
    const results: QuizQuestionData[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const answers = handleAnswers(row);
          const questionData: QuizQuestionData = QuizQuestionDataSchema.parse({
            questionText: row["Question Text"],
            title: row["Assessment"],
            topicType: "badge", // Defaulting topic type
            questionType:
              row["Answer"].length > 1 ? "multipleCorrect" : "singleCorrect",
            answers,
            tags: row["tags"] ? row["tags"].split(",") : [],
          });
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
