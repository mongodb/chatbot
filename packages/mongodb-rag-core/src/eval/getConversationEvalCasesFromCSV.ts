import { parse } from "csv";
import fs from "fs";
import { ConversationEvalCase } from "./getConversationEvalCasesFromYaml";

export const getConversationEvalCasesFromCSV = async (
  csvFilePath: string
): Promise<ConversationEvalCase[]> => {
  const records = [];
  const parser = fs.createReadStream(csvFilePath).pipe(
    parse({
      columns: true, // Treat first line as header row
      skip_empty_lines: true, // Skip empty lines
      trim: true, // Trim whitespace from fields
    })
  );
  for await (const record of parser) {
    const {
      Question: question,
      "Ideal Answer": idealAnswer,
      "Expected sources (comma separated URLs)": expectedSources,
    } = record;
    const formattedRecord: ConversationEvalCase = {
      name: question,
      messages: [
        {
          role: "user" as const,
          content: question,
        },
      ],
      expectation: idealAnswer,
      expectedLinks: expectedSources
        ? expectedSources.split(",").map((link: string) => link.trim())
        : [],
    };
    records.push(formattedRecord);
  }
  return records;
};
