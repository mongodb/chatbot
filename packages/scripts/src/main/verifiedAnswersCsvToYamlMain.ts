import * as csv from "csv";
import * as yaml from "yaml";
import { promises as fs } from "fs";

type CsvEntry = {
  questions: string;
  faqId: string;
  answer: string;
  references: string;
  author_email: string;
};

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
  const csvEntries = (await csv
    .parse(source, { columns: true })
    .toArray()) as CsvEntry[];

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
