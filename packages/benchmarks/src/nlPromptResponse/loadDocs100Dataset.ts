import { LanguageModel } from "ai";
import {
  tagifyMetadata,
  classifyMongoDbMetadata,
} from "mongodb-rag-core/mongoDbMetadata";
import { NlPromptResponseEvalCase } from "./NlQuestionAnswerEval";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

type Docs100Row = {
  Question: string;
  TeamtoReview: string;
  Author: string;
  ExpectedSources: string; // This will be a comma-separated string of URLs
  IdealAnswer: string;
  DateCreated: string; // Assuming date is stored as a string
  AdditionalNotes: string;
};

export async function parseDocs100QARow(
  row: Docs100Row,
  model: LanguageModel
): Promise<NlPromptResponseEvalCase> {
  const tags = ["docs", "docs_100"];
  const conversation = `<Question>
${row.Question}
</Question>
<Answer>
${row.IdealAnswer}
</Answer>`;
  tags.push(
    ...tagifyMetadata(await classifyMongoDbMetadata(model, conversation))
  );
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
      reference: row.IdealAnswer,
      links: row.ExpectedSources.split(",").map((l) => l.trim()),
    },
    metadata: {
      reviewer: row.Author,
      teamReviewer: row.TeamtoReview,
      dateCreated: row.DateCreated,
      additionalNotes: row.AdditionalNotes,
    },
    tags,
  };
}

export function loadDocs100QACsv(filePath: string): Docs100Row[] {
  try {
    // Read the CSV file
    const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as Docs100Row[];

    console.log(
      `Loaded ${records.length} records from ${path.basename(filePath)}`
    );
    return records;
  } catch (error) {
    console.error(`Error loading CSV file ${filePath}:`, error);
    throw error;
  }
}
