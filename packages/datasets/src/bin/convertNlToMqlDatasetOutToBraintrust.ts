/**
  create a CLI that converts a JSONL file ofDatabaseNlQueryDatasetEntry to a JSON file of 
  DatabaseNlQueryDatasetEntryBraintrust

  Args:
    - inputPath: path to the input JSONL file. Required.
    - outputDir: path to the output JSON file. Optional. If not provided, will write to the same directory as the input file.

  when complete, print the number of entries in the output file. also log the output path.

  use yargs to orchestrate the CLI.
 */
import {
  DatabaseNlQueryDatasetEntry,
  DatabaseNlQueryDatasetEntryBraintrust,
  convertDatabaseNlQueryDatasetEntryToBraintrust,
} from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as fs from "fs";
import * as path from "path";

interface Args {
  inputPath: string;
  outputDir?: string;
}

async function main() {
  const argv = (await yargs(hideBin(process.argv))
    .option("inputPath", {
      alias: "i",
      type: "string",
      description: "Path to the input JSONL file",
      demandOption: true,
    })
    .option("outputDir", {
      alias: "o",
      type: "string",
      description:
        "Path to the output directory (optional, defaults to input file directory)",
    })
    .help()
    .parse()) as Args;

  const { inputPath, outputDir } = argv;

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file does not exist: ${inputPath}`);
    process.exit(1);
  }

  const inputFileContent = fs.readFileSync(inputPath, "utf-8");
  const lines = inputFileContent.trim().split("\n");

  const convertedEntries: DatabaseNlQueryDatasetEntryBraintrust[] = [];

  for (const line of lines) {
    if (line.trim()) {
      try {
        const entry: DatabaseNlQueryDatasetEntry = JSON.parse(line);
        const convertedEntry =
          convertDatabaseNlQueryDatasetEntryToBraintrust(entry);
        convertedEntries.push(convertedEntry);
      } catch (error) {
        console.error(`Error parsing line: ${line}`);
        console.error(error);
        process.exit(1);
      }
    }
  }

  const inputDir = path.dirname(inputPath);
  const inputBaseName = path.basename(inputPath, path.extname(inputPath));
  const outputDirPath = outputDir || inputDir;
  const outputPath = path.join(
    outputDirPath,
    `${inputBaseName}-braintrust.json`
  );

  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(convertedEntries, null, 2));

  console.log(`Converted ${convertedEntries.length} entries`);
  console.log(`Output written to: ${outputPath}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Error running conversion:", error);
    process.exit(1);
  });
}
