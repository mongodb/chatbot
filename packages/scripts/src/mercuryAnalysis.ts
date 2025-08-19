import "dotenv/config";
import { getEnv } from "mongodb-rag-core";
import { MongoClient, ObjectId } from "mongodb";
import { createOpenAI } from "mongodb-rag-core/aiSdk";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { parse } from "csv/sync";
import { stringify } from "csv/sync";
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
}

// Analysis result structure
interface AnalysisResult {
  promptId: string;
  analyzedPrompt: string;
  analyzedResponse: string;
  relevanceScore: number;
  qualityAnalysis: string;
  qualityGuidance: string;
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
      "promptText",
      "promptId",
      "comments",
      "suggestedPromptChange",
      "suggestedResponseChange",
      "currentExpectedResponse",
    ],
    skip_empty_lines: true,
    trim: true,
    from_line: 3, // Skip header (line 1) and placeholder (line 2)
  }) as CsvRow[];

  return records;
}

// Analyze a single prompt-response pair
async function analyzeRow(
  csvRow: CsvRow,
  analyzeCases: ReturnType<typeof makeAnalyzeCases>,
  casesCollection: import("mongodb").Collection
): Promise<AnalysisResult | null> {
  console.log(
    `\nAnalyzing row: ${
      csvRow.promptId || csvRow.promptText.substring(0, 50)
    }...`
  );

  // Determine the prompt to analyze
  let promptToAnalyze = csvRow.promptText;
  let responseToAnalyze = csvRow.currentExpectedResponse;

  // Override with suggested changes if provided
  if (
    csvRow.suggestedPromptChange &&
    csvRow.suggestedPromptChange.trim() !== ""
  ) {
    promptToAnalyze = csvRow.suggestedPromptChange;
    console.log("Using suggested prompt change");
  }

  if (
    csvRow.suggestedResponseChange &&
    csvRow.suggestedResponseChange.trim() !== ""
  ) {
    responseToAnalyze = csvRow.suggestedResponseChange;
    console.log("Using suggested response change");
  }

  // If we have a promptId, we can get additional data from MongoDB
  let finalPromptId = csvRow.promptId;

  if (csvRow.promptId && csvRow.promptId.trim() !== "") {
    try {
      const caseId = ObjectId.createFromHexString(csvRow.promptId);
      const caseDoc = await casesCollection.findOne({ _id: caseId });

      if (caseDoc) {
        // If prompt text is not overridden and we have case data, use the case prompt
        if (csvRow.suggestedPromptChange.trim() === "" && !csvRow.promptText) {
          const casePromptText =
            caseDoc.prompt
              ?.filter((p: { role: string }) => p.role === "user")
              ?.map((p: { content: string }) => p.content)
              ?.join("\n") || "";

          if (casePromptText) {
            promptToAnalyze = casePromptText;
          }
        }

        // If no current expected response and we have case data, use case expected
        if (!responseToAnalyze && caseDoc.expected) {
          responseToAnalyze = caseDoc.expected;
        }
      }
    } catch (error) {
      console.error(`Invalid ObjectId or database error: ${csvRow.promptId}`);
      // Continue with CSV data
    }
  } else {
    // Generate a simple ID for cases without promptId
    finalPromptId = csvRow.promptText
      .substring(0, 20)
      .replace(/[^a-zA-Z0-9]/g, "_");
  }

  // Validate we have both prompt and response
  if (!promptToAnalyze || !responseToAnalyze) {
    console.error(`Missing prompt or response for row: ${finalPromptId}`);
    return null;
  }

  console.log(`Analyzing prompt: "${promptToAnalyze.substring(0, 100)}..."`);
  console.log(
    `Analyzing response: "${responseToAnalyze.substring(0, 100)}..."`
  );

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
      `✓ Analysis complete. Relevance score: ${relevanceScore.toFixed(4)}`
    );

    return {
      promptId: finalPromptId,
      analyzedPrompt: promptToAnalyze,
      analyzedResponse: responseToAnalyze,
      relevanceScore,
      qualityAnalysis,
      qualityGuidance,
    };
  } catch (error) {
    console.error(`Error analyzing row ${finalPromptId}: ${error}`);
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
  ];

  const data = results.map((result) => [
    result.promptId,
    result.analyzedPrompt,
    result.analyzedResponse,
    result.relevanceScore.toFixed(4),
    result.qualityAnalysis,
    result.qualityGuidance,
  ]);

  const csvContent = stringify([headers, ...data], {
    quoted_string: true,
    quoted_empty: true,
  });

  writeFileSync(outputPath, csvContent, "utf-8");

  console.log(`\n✓ Results written to: ${outputPath}`);
  console.log(`Analyzed ${results.length} rows successfully`);
}

async function main() {
  // Get command line argument for CSV file path
  const csvFilePath = process.argv[2];
  if (!csvFilePath) {
    console.error("Usage: npm run mercury-analysis <path-to-csv-file>");
    process.exit(1);
  }

  console.log(`Reading CSV file: ${csvFilePath}`);
  const csvRows = parseCsv(csvFilePath);
  console.log(`Found ${csvRows.length} rows to process`);

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
  });

  // Connect to MongoDB
  const client = await MongoClient.connect(MERCURY_CONNECTION_URI);
  const db = client.db(MERCURY_DATABASE_NAME);
  const casesCollection = db.collection(MERCURY_CASES_COLLECTION_NAME);

  try {
    console.log(
      `Connected to ${MERCURY_DATABASE_NAME}.${MERCURY_CASES_COLLECTION_NAME}`
    );

    // Process each CSV row with parallelization
    console.log(
      `\nProcessing ${csvRows.length} rows with concurrency of 10...`
    );

    const { results, errors } = await PromisePool.withConcurrency(10)
      .for(csvRows)
      .process(async (csvRow) => {
        return await analyzeRow(csvRow, analyzeCases, casesCollection);
      });

    // Filter out null results and log any errors
    const validResults = results.filter(
      (result) => result !== null
    ) as AnalysisResult[];

    if (errors.length > 0) {
      console.error(`\n⚠ ${errors.length} errors occurred during processing:`);
      errors.forEach((error, index) => {
        console.error(`Error ${index + 1}:`, error);
      });
    }

    console.log(
      `\n✓ Successfully processed ${validResults.length} out of ${csvRows.length} rows`
    );

    // Generate output CSV
    await generateOutputCsv(validResults);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
