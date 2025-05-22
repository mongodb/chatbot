import { LanguageModel } from "ai";
import {
  tagifyMetadata,
  classifyMongoDbMetadata,
} from "mongodb-rag-core/mongoDbMetadata";
import { NlPromptResponseEvalCase } from "./NlQuestionAnswerEval";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

type ProductKnowledgeRow = {
  ProductName: string;
  Question: string;
  Author: string;
  ExpectedSources: string; // This will be a comma-separated string of URLs
  IdealAnswer: string;
  DateCreated: string; // Assuming date is stored as a string
  AdditionalNotes: string;
};

export async function parseProductKnowledgeQARow(
  row: ProductKnowledgeRow,
  model: LanguageModel
): Promise<NlPromptResponseEvalCase> {
  const tags = ["product_knowledge"];
  const conversation = `
<ProductName>
${row.ProductName}
</ProductName>
<Question>
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
      productName: row.ProductName,
      dateCreated: row.DateCreated,
      additionalNotes: row.AdditionalNotes,
    },
    tags,
  };
}

export function loadProductKnowledgeQACsv(
  filePath: string
): ProductKnowledgeRow[] {
  try {
    // Read the CSV file
    const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as ProductKnowledgeRow[];

    console.log(
      `Loaded ${records.length} records from ${path.basename(filePath)}`
    );
    return records;
  } catch (error) {
    console.error(`Error loading CSV file ${filePath}:`, error);
    throw error;
  }
}
