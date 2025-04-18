import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { NlPromptResponseEvalCase } from "./NlQuestionAnswerEval";
import { extractMongoDbTags } from "../tagData";
import { LanguageModel } from "ai";

/**
  Interface representing a row in the tech support Q&A CSV file
 */
export interface TechSupportQARow {
  /** The question asked by the user */
  Question: string;
  /** The answer provided to the question */
  Answer: string;
  /** The third column which contains validation status ("True - Correct" or "False - Incorrect") */
  "": string;
  /** Name of the person who reviewed the Q&A */
  "Reviewer Name": string;
  /** Team recommended to review the Q&A */
  "Recommended Team to Review": string;
  /** Name of the team member who reviewed the Q&A */
  "Name of Team Reviewer": string;
  /** URL of the first source */
  Source_1_URL: string;
  /** Title of the first source */
  Source_1_TITLE: string;
  /** Relevance score of the first source */
  Source_1_SCORE: string;
  /** URL of the second source */
  Source_2_URL: string;
  /** Title of the second source */
  Source_2_TITLE: string;
  /** Relevance score of the second source */
  Source_2_SCORE: string;
  /** URL of the third source */
  Source_3_URL: string;
  /** Title of the third source */
  Source_3_TITLE: string;
  /** Relevance score of the third source */
  Source_3_SCORE: string;
  /** Original question number */
  "Original Number": string;
}

export function filterTechSupportQARow(row: TechSupportQARow): boolean {
  const isCorrect = row[""] === "True - Correct";
  const hasQuestion = !!row.Question;
  const hasAnswer = !!row.Answer;
  return isCorrect && hasQuestion && hasAnswer;
}

export async function parseTechSupportQARow(
  row: TechSupportQARow,
  model: LanguageModel
): Promise<NlPromptResponseEvalCase> {
  const tags = ["tech_support"];
  const conversation = `
  Question: ${row.Question}
  Answer: ${row.Answer}`;
  tags.push(...(await extractMongoDbTags(model, conversation)));
  return {
    input: {
      messages: [
        {
          role: "user",
          content: row.Question,
        },
      ],
    },
    expected: {
      reference: row.Answer,
      links: [row.Source_1_URL, row.Source_2_URL, row.Source_3_URL]
        // filter for only truthy values (i.e. remove empty strings or undefined)
        .filter((l) => !!l),
    },
    metadata: {
      reviewer: row["Reviewer Name"],
      teamReviewer: row["Name of Team Reviewer"],
    },
    tags,
  };
}

export function loadTechSupportQACsv(filePath: string): TechSupportQARow[] {
  try {
    // Read the CSV file
    const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as TechSupportQARow[];

    console.log(
      `Loaded ${records.length} records from ${path.basename(filePath)}`
    );
    return records;
  } catch (error) {
    console.error(`Error loading CSV file ${filePath}:`, error);
    throw error;
  }
}
