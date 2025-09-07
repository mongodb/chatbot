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

// const createTagsFromAssessmentName = (assessmentName: string) => {
//   return assessmentName.split(",").map((tag) => tag.trim());
// };

const assessmentNameToTagsMap = {
  'MongoDB Aggregation Fundamentals': ['aggregation'],
  'MongoDB Query Optimization Techniques': ['query'],
  "From Relational Model (SQL) to MongoDB's Document Model": ['data_modeling'],
  'MongoDB Schema Design Patterns and Antipatterns': ['data_modeling'],
  'MongoDB Advanced Schema Design Patterns and Antipatterns': ['data_modeling'],
  'MongoDB Schema Design Optimization': ['data_modeling'],
  'Building AI Agents with MongoDB': ['gen_ai'],
  'Building AI-Powered Search with MongoDB Vector Search': ['gen_ai'],
  'Building RAG Apps Using MongoDB': ['gen_ai'],
  'MongoDB Indexing Design Fundamentals': ['indexing'],
  'Monitoring MongoDB with Built-in Tools': ['monitoring_tuning_and_automation'],
  'Optimizing MongoDB Performance with Tuning Tools': ['monitoring_tuning_and_automation'],
  'CRUD Operations in MongoDB': ['query'], 
  'Search with MongoDB': ['search'],
  'Securing MongoDB Atlas: Authentication & Authorization': ['security'],
  'Securing MongoDB Self-Managed: Authentication & Authorization': ['security'],
  'MongoDB Sharding Strategies': ['sharding'],
  'Optimizing and Maintaining MongoDB Cluster Reliability': ['performance_at_scale'],
};

// excluded:
// 'MongoDB Overview: Core Concepts and Architecture'

const parseCSV = async (filePath: string): Promise<QuizQuestionData[]> => {
  return new Promise((resolve, reject) => {
    const results: QuizQuestionData[] = [];
    const assessments = new Set<string>();
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // console.log("HIT TRY");
        try {
          const assessmentName = row["Assessment"]?.trim();
          if (!assessmentName) {
            console.warn("Skipping row with missing assessment name");
            return;
          }
          
          // Type guard to ensure assessmentName is a valid key
          if (assessmentName in assessmentNameToTagsMap) {
            console.log('>> tags', assessmentNameToTagsMap[assessmentName as keyof typeof assessmentNameToTagsMap]);
          } else {
            console.warn(`Assessment name not found in map: "${assessmentName}"`);
          }
          
          const answers = handleAnswers(row);
          const questionData: QuizQuestionData = QuizQuestionDataSchema.parse({
            questionText: row["Question Text"],
            title: assessmentName,
            topicType: "badge", // Defaulting topic type
            questionType:
              row["Answer"].length > 1 ? "multipleCorrect" : "singleCorrect",
            answers,
            // tags: row["tags"] ? row["tags"].split(",") : [],
            tags: assessmentName in assessmentNameToTagsMap 
              ? assessmentNameToTagsMap[assessmentName as keyof typeof assessmentNameToTagsMap] 
              : [],
          });
          results.push(questionData);
          // console.log(">>>> assessments >>>>", assessments);
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
