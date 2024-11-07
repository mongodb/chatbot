import * as csv from "csv/sync";
import * as yaml from "yaml";
import { promises as fs } from "fs";
import { z } from "zod";

const CsvEntrySchema = z.object({
  questions: z.string(),
  faqId: z.string(),
  answer: z.string(),
  references: z.string(),
  author_email: z.string(),
});

const YamlEntrySchema = z.object({
  questions: z.array(z.string()),
  answer: z.string(),
  references: z.array(z.object({ url: z.string() })),
  author_email: z.string(),
});

type CsvEntry = z.infer<typeof CsvEntrySchema>;
type YamlEntry = z.infer<typeof YamlEntrySchema>;

async function main() {
  const csvPath = process.argv.slice(-1)[0];

  if (!/\.csv$/i.test(csvPath)) {
    throw new Error(
      `Expected csv path argument ending in .csv, got '${csvPath}'!`
    );
  }

  const source = await fs.readFile(csvPath, "utf8");
  const parsedCsvFile = csv.parse(source, { columns: true }).toArray();
  const csvEntries = z.array(CsvEntrySchema).parse(parsedCsvFile);

  const yamlEntries = csvEntries.map(
    ({ answer, author_email, questions, references }) =>
      YamlEntrySchema.parse({
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
