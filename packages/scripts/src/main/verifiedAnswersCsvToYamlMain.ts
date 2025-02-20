import { parse as parseCsv } from "csv-parse";
import * as yaml from "yaml";
import { promises as fs } from "fs";
import { z } from "zod";

const csvEntrySchema = z.object({
  questions: z.string(),
  faqId: z.string(),
  answer: z.string(),
  references: z.string(),
  author_email: z.string(),
});

type CsvEntry = z.infer<typeof csvEntrySchema>;

type YamlEntry = {
  questions: string[];
  answer: string;
  references: { url: string }[];
  author_email: string;
};

async function main() {
  const csvPath = process.argv.slice(-1)[0];

  if (!/\.csv$/i.test(csvPath)) {
    throw new Error(
      `Expected csv path argument ending in .csv, got '${csvPath}'!`
    );
  }

  const source = await fs.readFile(csvPath, "utf8");
  const parsedSource = parseCsv(source, { columns: true });
  const csvEntries: CsvEntry[] = [];
  for await (const entry of parsedSource) {
    const csvEntryParseResult = csvEntrySchema.safeParse(entry);
    if (!csvEntryParseResult.success) {
      throw new Error(
        `Invalid csv entry: ${JSON.stringify(csvEntryParseResult.error)}`
      );
    }
    csvEntries.push(csvEntryParseResult.data);
  }

  const yamlEntries = csvEntries.map(
    ({ answer, author_email, questions, references }): YamlEntry => ({
      answer,
      author_email,
      questions: [questions],
      references: references
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .map((url) => ({ url })),
    })
  );

  console.log(yaml.stringify(yamlEntries));
}

main();
