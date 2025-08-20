import "dotenv/config";
import { getEnv } from "mongodb-rag-core";
import { MongoClient, Collection, ObjectId } from "mongodb-rag-core/mongodb";
import { createOpenAI } from "mongodb-rag-core/aiSdk";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { parse, stringify } from "csv/sync";
import { makeAnalyzeCases } from "mercury-case-analysis";
import { PromisePool } from "@supercharge/promise-pool";

// CSV row structure for the input file
interface CsvRow {
  action: string;
  category: string;
  org: string;
  name: string;
  promptText: string;
  promptId: string;
  comments: string;
  suggestedPromptChange: string;
  suggestedResponseChange: string;
  currentExpectedResponse: string;
  tags: string;
}

// Analysis result structure
interface AnalysisResult {
  promptId: string;
  analyzedPrompt: string;
  analyzedResponse: string;
  relevanceScore: number;
  qualityAnalysis: string;
  qualityGuidance: string;
  source: "csv" | "database";
  action?: string;
  tags?: string;
}

// Database case structure
interface DatabaseCase {
  _id: ObjectId;
  name?: string;
  expected?: string;
  tags?: string;
}

// Combined row structure for processing
interface ProcessingRow {
  promptId: string;
  promptText: string;
  expectedResponse: string;
  source: "csv" | "database";
  action?: string;
  tags?: string;
}

// Parse CSV file using the csv package
function parseCsv(filePath: string): CsvRow[] {
  const csvContent = readFileSync(filePath, "utf-8");

  // Parse with headers, skip the first data row (placeholder)
  const records = parse(csvContent, {
    columns: [
      "action",
      "category",
      "org",
      "name",
      "promptId",
      "promptText",
      "currentExpectedResponse",
      "suggestedPromptChange",
      "suggestedResponseChange",
      "comments",
      "tags",
    ],
    skip_empty_lines: true,
    trim: true,
    from_line: 3, // Skip header (line 1) and placeholder (line 2)
  }) as CsvRow[];

  return records;
}

// Fetch all cases from the database
async function fetchAllDatabaseCases(
  casesCollection: Collection
): Promise<ProcessingRow[]> {
  console.log(`Fetching all cases from the database`);
  const cursor = casesCollection.find<DatabaseCase>({});
  const dbCases = await cursor.toArray();
  const rows = dbCases.map((caseDoc: DatabaseCase) => {
    const promptText = caseDoc.name || "";
    const expectedResponse = caseDoc.expected || "";

    if (promptText && expectedResponse) {
      return {
        promptId: caseDoc._id.toHexString(),
        promptText,
        expectedResponse,
        source: "database",
        tags: caseDoc.tags,
      } satisfies ProcessingRow;
    }
    return null;
  });

  console.log(`Found ${rows.length} cases in the database`);
  const nonNullCases = rows.filter((row) => row !== null) as ProcessingRow[];
  console.log(`Found ${nonNullCases.length} non-null cases in the database`);
  return nonNullCases;
}

// Convert CSV row to ProcessingRow
function csvRowToProcessingRow(csvRow: CsvRow): ProcessingRow | null {
  // Determine the prompt and response to use
  let promptText = csvRow.promptText || "";
  let expectedResponse = csvRow.currentExpectedResponse || "";

  // Use suggested changes if provided
  if (
    csvRow.suggestedPromptChange &&
    csvRow.suggestedPromptChange.trim() !== ""
  ) {
    promptText = csvRow.suggestedPromptChange;
  }

  if (
    csvRow.suggestedResponseChange &&
    csvRow.suggestedResponseChange.trim() !== ""
  ) {
    expectedResponse = csvRow.suggestedResponseChange;
  }

  // Generate a promptId if not provided
  let promptId = csvRow.promptId;
  if (!promptId || promptId.trim() === "") {
    promptId = csvRow.promptText.substring(0, 20).replace(/[^a-zA-Z0-9]/g, "_");
  }

  if (!promptText || !expectedResponse) {
    return null;
  }

  return {
    promptId,
    promptText,
    expectedResponse,
    source: "csv",
    action: csvRow.action,
    tags: csvRow.tags,
  };
}

// Merge CSV rows with database cases based on action precedence
function mergeRowsWithPrecedence(
  csvRows: CsvRow[],
  databaseCases: ProcessingRow[]
): ProcessingRow[] {
  const result: ProcessingRow[] = [];
  const processedPromptIds = new Set<string>();

  // Convert CSV rows to ProcessingRows
  const csvProcessingRows = csvRows
    .map(csvRowToProcessingRow)
    .filter((row): row is ProcessingRow => row !== null);

  // First, add all CSV rows
  for (const csvRow of csvProcessingRows) {
    if (csvRow.action === "Update" || csvRow.action === "Review") {
      // Update/Review actions: these will override any database case with same promptId
      processedPromptIds.add(csvRow.promptId);
    }
    // Note: Create actions preserve their original promptId and are always added

    result.push(csvRow);
    if (csvRow.action === "Update" || csvRow.action === "Review") {
      processedPromptIds.add(csvRow.promptId);
    }
  }

  // Then, add database cases that weren't overridden
  for (const dbCase of databaseCases) {
    if (!processedPromptIds.has(dbCase.promptId)) {
      result.push(dbCase);
    }
  }

  return result;
}

// Parse command line arguments
function parseArguments(): { csvFilePath: string | null; includeAll: boolean } {
  const args = process.argv.slice(2);
  let csvFilePath: string | null = null;
  let includeAll = false;

  console.log(`args: ${args.join(" : ")}`);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--all") {
      includeAll = true;
    } else if (!csvFilePath && !arg.startsWith("--")) {
      csvFilePath = arg;
    }
  }

  return { csvFilePath, includeAll };
}

// Analyze a single processing row
async function analyzeProcessingRow(
  row: ProcessingRow,
  analyzeCases: ReturnType<typeof makeAnalyzeCases>
): Promise<AnalysisResult | null> {
  const promptToAnalyze = row.promptText;
  const responseToAnalyze = row.expectedResponse;
  const finalPromptId = row.promptId;
  const truncatedPrompt = promptToAnalyze.substring(0, 50).replace(/\s+/g, " ");

  // Validate we have both prompt and response
  if (!promptToAnalyze || !responseToAnalyze) {
    console.log(
      `${finalPromptId} | "${truncatedPrompt}..." | ERROR: Missing data`
    );
    return null;
  }

  try {
    // Run the analysis
    const analysis = await analyzeCases({
      cases: [
        {
          prompt: promptToAnalyze,
          response: responseToAnalyze,
        },
      ],
    });

    const result = analysis[0];
    if (!result) {
      console.error(`No analysis result for row: ${finalPromptId}`);
      return null;
    }

    const relevanceScore = result.relevance?.scores?.cos_similarity || 0;
    const qualityAnalysis = JSON.stringify(result.quality || {});
    const qualityGuidance = result.quality?.guidance || "";

    console.log(
      `${finalPromptId} | "${truncatedPrompt}..." | Score: ${relevanceScore.toFixed(
        4
      )}`
    );

    return {
      promptId: finalPromptId,
      analyzedPrompt: promptToAnalyze,
      analyzedResponse: responseToAnalyze,
      relevanceScore,
      qualityAnalysis,
      qualityGuidance,
      source: row.source,
      action: row.source === "csv" ? row.action : undefined,
      tags: row.tags,
    };
  } catch (error) {
    console.log(`${finalPromptId} | "${truncatedPrompt}..." | ERROR: ${error}`);
    return null;
  }
}

// Generate output CSV file
async function generateOutputCsv(results: AnalysisResult[]) {
  const timestamp = Date.now();
  const desktopPath = join(homedir(), "Desktop");
  const outputPath = join(
    desktopPath,
    `mercury_analysis_results_${timestamp}.csv`
  );

  const headers = [
    "Prompt ID",
    "Analyzed Prompt",
    "Analyzed Response",
    "Relevance Score",
    "Quality Analysis",
    "Quality Guidance",
    "Source",
    "Action",
    "Tags",
  ];

  const data = results.map((result) => [
    result.promptId,
    result.analyzedPrompt,
    result.analyzedResponse,
    result.relevanceScore.toFixed(4),
    result.qualityAnalysis,
    result.qualityGuidance,
    result.source,
    result.action || "",
    result.tags || "",
  ]);

  const csvContent = stringify([headers, ...data], {
    quoted_string: true,
    quoted_empty: true,
  });

  writeFileSync(outputPath, csvContent, "utf-8");

  console.log(`Results written to: ${outputPath}`);
}

async function main() {
  // Parse command line arguments
  const { csvFilePath, includeAll } = parseArguments();

  if (!csvFilePath && !includeAll) {
    console.error("Usage: npm run mercury-analysis <path-to-csv-file> [--all]");
    process.exit(1);
  }

  let csvRows: CsvRow[] = [];
  if (csvFilePath) {
    csvRows = parseCsv(csvFilePath);
  }

  // Setup environment variables and models
  const {
    MERCURY_CONNECTION_URI,
    MERCURY_DATABASE_NAME,
    MERCURY_CASES_COLLECTION_NAME,
    MERCURY_GENERATOR_MODEL_NAME,
    MERCURY_JUDGEMENT_MODEL_NAME,
    OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
    BRAINTRUST_API_KEY,
    BRAINTRUST_PROXY_ENDPOINT,
  } = getEnv({
    required: [
      "MERCURY_CONNECTION_URI",
      "MERCURY_DATABASE_NAME",
      "MERCURY_CASES_COLLECTION_NAME",
      "MERCURY_GENERATOR_MODEL_NAME",
      "MERCURY_JUDGEMENT_MODEL_NAME",
      "OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT",
      "BRAINTRUST_API_KEY",
      "BRAINTRUST_PROXY_ENDPOINT",
    ],
  });

  // Create OpenAI models via Braintrust proxy
  const openaiClient = createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_PROXY_ENDPOINT,
  });

  const embeddingModels = [
    openaiClient.textEmbeddingModel(OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT),
  ];

  const generatorModel = openaiClient.chat(MERCURY_GENERATOR_MODEL_NAME);
  const judgementModel = openaiClient.chat(MERCURY_JUDGEMENT_MODEL_NAME);

  // Setup analyzeCases function
  const analyzeCases = makeAnalyzeCases({
    embeddingModels,
    generatorModel,
    judgementModel,
    shouldLog: false,
  });

  // Connect to MongoDB
  const client = await MongoClient.connect(MERCURY_CONNECTION_URI);
  const db = client.db(MERCURY_DATABASE_NAME);
  const casesCollection = db.collection(MERCURY_CASES_COLLECTION_NAME);

  try {
    // Prepare rows for processing
    let processingRows: ProcessingRow[];

    console.log(`includeAll: ${includeAll}`);

    if (includeAll) {
      // Fetch all database cases and merge with CSV
      const databaseCases = await fetchAllDatabaseCases(casesCollection);
      processingRows = mergeRowsWithPrecedence(csvRows, databaseCases);
    } else {
      // Process only CSV rows
      processingRows = csvRows
        .map(csvRowToProcessingRow)
        .filter((row): row is ProcessingRow => row !== null);
    }

    // Show summary statistics
    const csvCount = processingRows.filter((r) => r.source === "csv").length;
    const dbCount = processingRows.filter(
      (r) => r.source === "database"
    ).length;
    console.log(
      `\nAnalyzing ${processingRows.length} cases (${csvCount} CSV + ${dbCount} DB)\n`
    );

    // Process each row with parallelization

    const { results, errors } = await PromisePool.withConcurrency(12)
      .for(processingRows)
      .process(async (row) => {
        return await analyzeProcessingRow(row, analyzeCases);
      });

    // Filter out null results and log any errors
    const validResults = results.filter(
      (result) => result !== null
    ) as AnalysisResult[];

    console.log(
      `\nCompleted: ${validResults.length} successful, ${errors.length} failed`
    );

    // Generate output CSV
    await generateOutputCsv(validResults);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
