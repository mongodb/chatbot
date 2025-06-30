import {
  DatabaseNlQueryDatasetEntry,
  convertDatabaseNlQueryDatasetEntryToBraintrust,
  DatabaseNlQueryDatasetEntryBraintrust,
  convertBraintrustDatabaseNlQueryDatasetEntryToFlat,
} from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { countAndLogUsage } from "../treeGeneration/databaseNlQueries/analyzeDataset";

async function readJsonlFile(
  filePath: string
): Promise<DatabaseNlQueryDatasetEntry[]> {
  const entries: DatabaseNlQueryDatasetEntry[] = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        const entry = JSON.parse(line) as DatabaseNlQueryDatasetEntry;
        entries.push(entry);
      } catch (error) {
        console.error(`Error parsing line in ${filePath}:`, error);
      }
    }
  }

  return entries;
}

async function main() {
  // 1. Get dataset from dataOut/anthropic-big-jsonl
  const dataOutDir = path.join(__dirname, "../../dataOut");
  const anthropicDir = path.join(dataOutDir, "anthropic-big-jsonl");

  if (!fs.existsSync(anthropicDir)) {
    console.error(`Directory not found: ${anthropicDir}`);
    process.exit(1);
  }

  // Get all .jsonl files
  const jsonlFiles = fs
    .readdirSync(anthropicDir)
    .filter((file) => file.endsWith(".jsonl"))
    .map((file) => path.join(anthropicDir, file));

  console.log(`Found ${jsonlFiles.length} JSONL files to process`);

  // 2. For each file, load the array of DatabaseNlQueryDatasetEntry into memory
  const allBraintrustEntries: DatabaseNlQueryDatasetEntryBraintrust[] = [];

  for (const filePath of jsonlFiles) {
    const fileName = path.basename(filePath);
    console.log(`Processing ${fileName}...`);

    const entries = await readJsonlFile(filePath);
    console.log(`  Loaded ${entries.length} entries`);

    // 3. Convert to Braintrust format and append filename to generationUuid
    for (const entry of entries) {
      const braintrustEntry =
        convertDatabaseNlQueryDatasetEntryToBraintrust(entry);

      // Append the filename to the generationUuid field
      if (braintrustEntry.metadata && braintrustEntry.metadata.generationUuid) {
        braintrustEntry.metadata.generationUuid = `${braintrustEntry.metadata.generationUuid}_${fileName}`;
      }

      allBraintrustEntries.push(braintrustEntry);
    }
  }

  console.log(
    `\nTotal entries before deduplication: ${allBraintrustEntries.length}`
  );

  // 5. De-duplicate the array based on the NL query
  const seenQueries = new Set<string>();
  const deduplicatedEntries = allBraintrustEntries.filter((entry) => {
    const nlQuery = entry.input?.nlQuery ?? "";
    if (seenQueries.has(nlQuery)) {
      return false;
    }
    seenQueries.add(nlQuery);
    return true;
  });

  console.log(
    `Total entries after deduplication: ${deduplicatedEntries.length}`
  );
  console.log(
    `Removed ${
      allBraintrustEntries.length - deduplicatedEntries.length
    } duplicate entries`
  );

  // 6. Write the array of braintrust entries to a new file
  const outputPath = path.join(dataOutDir, "anthropic-big-braintrust.json");
  fs.writeFileSync(outputPath, JSON.stringify(deduplicatedEntries));

  console.log(
    `\nSuccessfully wrote ${deduplicatedEntries.length} entries to ${outputPath}`
  );
  countAndLogUsage(
    deduplicatedEntries.map(convertBraintrustDatabaseNlQueryDatasetEntryToFlat)
  );
}

// Run the main function
main().catch((error) => {
  console.error("Error in main:", error);
  process.exit(1);
});
