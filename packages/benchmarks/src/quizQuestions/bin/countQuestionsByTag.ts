import fs from "fs";
import path from "path";
import { QuizQuestionData, QuizQuestionDataSchema } from "../QuizQuestionData";
const testDataPath = path.resolve(__dirname, "..", "..", "..", "testData");
const fileInPath = path.resolve(testDataPath, "quiz-badge-questions.json");

const createReportForFile = (filePath: string) => {
  const qs = JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown[];
  const allQuestions = qs.map(
    (q) => QuizQuestionDataSchema.parse(q) satisfies QuizQuestionData
  );
  const report = makeReport(allQuestions);
  console.log(report);
};

function countTags(questions: QuizQuestionData[]): Record<string, number> {
  return questions.reduce((acc, q) => {
    q.tags?.forEach((tag) => {
      acc[tag] = acc[tag] ? acc[tag] + 1 : 1;
    });
    return acc;
  }, {} as Record<string, number>);
}
function makeReport(questions: QuizQuestionData[]): string {
  const tagCounts = countTags(questions);
  const tags = Object.keys(tagCounts).sort();
  const counts = tags.map((tag) => `'${tag}': ${tagCounts[tag]}`).join("\n");
  return `MDBU Question Report
  
${counts}

Total number of questions: ${questions.length}`;
}

createReportForFile(fileInPath);
