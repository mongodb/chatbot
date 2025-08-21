import "dotenv/config";
import { getEnv } from "mongodb-rag-core";
import { MongoClient, Collection, ObjectId } from "mongodb-rag-core/mongodb";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { parse } from "csv/sync";
import { classifyCategories } from "./llm-scorecard/classifyCategories";

// CSV row structure for the input file
interface CsvRow {
  promptId: string;
  prompt: string;
  response: string;
  relevanceScore: string;
  qualityAnalysis: string;
  qualityGuidance: string;
  source: string;
  action: "No Action" | "Update" | "Create" | "Delete" | "Review" | "";
  tags: string;
}

// Processed row structure
interface ProcessedRow {
  promptId: string;
  promptText: string;
  expectedResponse: string;
  source: "csv";
  action: "No Action" | "Update" | "Create" | "Delete" | "Review";
  tags: string[];
  relevanceScore: number;
  qualityAnalysis: Record<string, unknown>;
}

// Database case structure (existing documents)
interface ExistingCase {
  _id: ObjectId;
  type?: string;
  tags?: string[];
  name?: string;
  prompt?: Array<{ role: string; content: string }>;
  expected?: string;
  metadata?: {
    reviewer?: string;
    category?: string;
    promptId?: string;
  };
  analysis?: {
    quality?: Record<string, unknown>;
    relevance?: number;
  };
}

// New document structure to be inserted
interface NewDocument {
  type: string;
  tags: string[];
  name: string;
  prompt: Array<{ role: string; content: string }>;
  expected: string;
  metadata: {
    reviewer: string;
    category: string;
    promptId?: string;
  };
  analysis: {
    quality: Record<string, unknown>;
    relevance: number;
  };
}

// Parse CSV file
function parseCsv(filePath: string): CsvRow[] {
  const csvContent = readFileSync(filePath, "utf-8");

  const records = parse(csvContent, {
    columns: [
      "promptId",
      "prompt",
      "response",
      "relevanceScore",
      "qualityAnalysis",
      "qualityGuidance",
      "source",
      "action",
      "tags",
    ],
    skip_empty_lines: true,
    trim: true,
    from_line: 2, // Skip header row
  }) as CsvRow[];

  return records;
}

// Convert CSV row to processed row
function processRow(csvRow: CsvRow): ProcessedRow | null {
  try {
    // Parse tags (JSON array of strings)
    let tags: string[] = [];
    if (csvRow.tags && csvRow.tags.trim() !== "") {
      tags = JSON.parse(csvRow.tags);
    }

    // Parse quality analysis (JSON object)
    let qualityAnalysis: Record<string, unknown> = {};
    if (csvRow.qualityAnalysis && csvRow.qualityAnalysis.trim() !== "") {
      qualityAnalysis = JSON.parse(csvRow.qualityAnalysis);
    }

    // Parse relevance score
    const relevanceScore = parseFloat(csvRow.relevanceScore) || 0;

    return {
      promptId: csvRow.promptId.trim(),
      promptText: csvRow.prompt.trim(),
      expectedResponse: csvRow.response.trim(),
      source: "csv",
      action: (csvRow.action || "No Action") as
        | "No Action"
        | "Update"
        | "Create"
        | "Delete"
        | "Review",
      tags,
      relevanceScore,
      qualityAnalysis,
    };
  } catch (error) {
    console.error(`Error processing CSV row: ${error}`);
    return null;
  }
}

// Fetch existing case by ObjectId
async function fetchExistingCase(
  casesCollection: Collection,
  promptId: string
): Promise<ExistingCase | null> {
  try {
    if (!promptId || promptId.trim() === "") {
      return null;
    }

    const objectId = new ObjectId(promptId);
    const existingCase = await casesCollection.findOne<ExistingCase>({
      _id: objectId,
    });
    return existingCase;
  } catch (error) {
    console.error(
      `Error fetching existing case for promptId ${promptId}: ${error}`
    );
    return null;
  }
}

// Create new document based on action type
async function createNewDocument(
  row: ProcessedRow,
  existingCase: ExistingCase | null
): Promise<NewDocument | null> {
  const {
    promptText,
    expectedResponse,
    tags,
    relevanceScore,
    qualityAnalysis,
    action,
  } = row;

  // Skip certain actions
  if (action === "Delete" || action === "Review") {
    return null;
  }

  // Determine metadata based on source
  let metadata: NewDocument["metadata"];

  if (
    existingCase &&
    (action === "Update" || action === "Create" || action === "No Action")
  ) {
    // Use existing case metadata as base
    metadata = {
      reviewer: existingCase.metadata?.reviewer || "Nick Larew",
      category:
        existingCase.metadata?.category ||
        (await classifyCategories({ input: promptText })).classification.type,
      promptId: row.promptId || undefined,
    };
  } else {
    // Create new metadata (for Create action with no existing case)
    metadata = {
      reviewer: "Nick Larew",
      category: (await classifyCategories({ input: promptText })).classification
        .type,
      promptId: row.promptId || undefined,
    };
  }

  // For "No Action", use existing tags if available, otherwise use CSV tags
  const finalTags =
    action === "No Action" && existingCase?.tags ? existingCase.tags : tags;

  // Create the new document
  const newDocument: NewDocument = {
    type: "prompt_response",
    tags: finalTags,
    name: promptText,
    prompt: [{ role: "user", content: promptText }],
    expected: expectedResponse,
    metadata,
    analysis: {
      quality: qualityAnalysis,
      relevance: relevanceScore,
    },
  };

  return newDocument;
}

// Process each row according to its action
async function processRowByAction(
  row: ProcessedRow,
  casesCollection: Collection
): Promise<NewDocument | null> {
  const { action, promptId } = row;

  console.log(
    `Processing row with action: ${action}, promptId: ${promptId || "empty"}`
  );

  switch (action) {
    case "Delete":
    case "Review":
      console.log(`  → Skipping (${action})`);
      return null;

    case "No Action": {
      if (!promptId) {
        console.error(`  → Error: No Action requires a promptId`);
        return null;
      }
      const existingCaseForNoAction = await fetchExistingCase(
        casesCollection,
        promptId
      );
      if (!existingCaseForNoAction) {
        console.error(
          `  → Error: Could not find existing case for promptId ${promptId}`
        );
        return null;
      }
      console.log(
        `  → No Action: preserving existing case metadata with CSV prompt/response`
      );
      return await createNewDocument(row, existingCaseForNoAction);
    }

    case "Update": {
      if (!promptId) {
        console.error(`  → Error: Update action requires a promptId`);
        return null;
      }
      const existingCaseForUpdate = await fetchExistingCase(
        casesCollection,
        promptId
      );
      if (!existingCaseForUpdate) {
        console.error(
          `  → Error: Could not find existing case for promptId ${promptId}`
        );
        return null;
      }
      console.log(`  → Updating existing case`);
      return await createNewDocument(row, existingCaseForUpdate);
    }

    case "Create": {
      if (promptId) {
        // Create based on existing case
        const existingCaseForCreate = await fetchExistingCase(
          casesCollection,
          promptId
        );
        if (existingCaseForCreate) {
          console.log(`  → Creating new case based on existing case`);
          return await createNewDocument(row, existingCaseForCreate);
        } else {
          console.log(
            `  → Warning: Could not find existing case for promptId ${promptId}, creating from scratch`
          );
        }
      } else {
        console.log(`  → Creating new case from scratch`);
      }
      return await createNewDocument(row, null);
    }

    default:
      console.error(`  → Error: Unknown action: ${action}`);
      return null;
  }
}

// Generate output JSON file
function generateOutputJson(documents: NewDocument[]) {
  const timestamp = Date.now();
  const desktopPath = join(homedir(), "Desktop");
  const outputPath = join(desktopPath, `mercury-data-${timestamp}.json`);

  const jsonContent = JSON.stringify(documents, null, 2);
  writeFileSync(outputPath, jsonContent, "utf-8");

  console.log(`JSON output written to: ${outputPath}`);
  return outputPath;
}

// Parse command line arguments
function parseArguments(): { csvFilePath: string | null } {
  const args = process.argv.slice(2);
  const csvFilePath = args[0] || null;

  if (!csvFilePath) {
    console.error("Usage: npm run mercury-data <path-to-csv-file>");
    process.exit(1);
  }

  return { csvFilePath };
}

async function main() {
  // Parse command line arguments
  const { csvFilePath } = parseArguments();

  if (!csvFilePath) {
    console.error("CSV file path is required");
    process.exit(1);
  }

  console.log(`Processing CSV file: ${csvFilePath}`);

  // Parse CSV file
  const csvRows = parseCsv(csvFilePath);
  console.log(`Parsed ${csvRows.length} rows from CSV`);

  // Process CSV rows
  const processedRows = csvRows
    .map(processRow)
    .filter((row): row is ProcessedRow => row !== null);

  console.log(`Successfully processed ${processedRows.length} rows`);

  // Setup environment variables
  const {
    MERCURY_CONNECTION_URI,
    MERCURY_DATABASE_NAME,
    MERCURY_CASES_COLLECTION_NAME,
  } = getEnv({
    required: [
      "MERCURY_CONNECTION_URI",
      "MERCURY_DATABASE_NAME",
      "MERCURY_CASES_COLLECTION_NAME",
    ],
  });

  // Connect to MongoDB
  console.log("Connecting to MongoDB...");
  const client = await MongoClient.connect(MERCURY_CONNECTION_URI);
  const db = client.db(MERCURY_DATABASE_NAME);
  const casesCollection = db.collection(MERCURY_CASES_COLLECTION_NAME);

  try {
    const newDocuments: NewDocument[] = [];

    // Process each row
    for (const row of processedRows) {
      const newDoc = await processRowByAction(row, casesCollection);
      if (newDoc) {
        newDocuments.push(newDoc);
      }
    }

    // Output results
    console.log(`\n=== RESULTS ===`);
    console.log(`Total processed rows: ${processedRows.length}`);
    console.log(
      `Documents to be inserted into llm_cases_new: ${newDocuments.length}`
    );

    // Generate JSON output file
    generateOutputJson(newDocuments);
    console.log(
      `\nGenerated ${newDocuments.length} documents for llm_cases_new collection`
    );
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed");
  }
}

main().catch(console.error);
