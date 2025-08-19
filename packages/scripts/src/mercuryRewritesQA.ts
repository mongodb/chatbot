import "dotenv/config";
import { getEnv } from "mongodb-rag-core";
import { MongoClient, ObjectId } from "mongodb";
import { createOpenAI } from "mongodb-rag-core/aiSdk";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { parse } from "csv/sync";
import { stringify } from "csv/sync";
import { makeAnalyzeCases, suggestRewrite } from "mercury-case-analysis";

// CSV row structure based on the headers you mentioned
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
}

// Working data structure for analysis
interface AnalysisRow {
  promptId: string;
  originalPrompt: string;
  originalResponse: string;
  currentPrompt: string;
  currentResponse: string;
  suggestedPromptChange?: string;
  suggestedResponseChange?: string;
  cosineScore?: number;
  iterations: number;
  lowScoreFlag: boolean;
  completed: boolean;
  // Track if user has already provided rewrites - these should be preserved
  userRewrittenPrompt: boolean;
  userRewrittenResponse: boolean;
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
    ],
    skip_empty_lines: true,
    trim: true,
    from_line: 3, // Skip header (line 1) and placeholder (line 2)
  }) as CsvRow[];

  return records;
}

// Process a single analysis row through all iterations immutably
async function processAnalysisRow(
  initialRow: AnalysisRow,
  analyzeCases: ReturnType<typeof makeAnalyzeCases>,
  generatorModel: ReturnType<ReturnType<typeof createOpenAI>["chat"]>
): Promise<AnalysisRow> {
  console.log(`\n--- Processing ${initialRow.promptId} ---`);

  let currentRow = { ...initialRow };

  // First, check the initial score before starting iterations
  console.log("Checking initial score...");
  const initialAnalysis = await analyzeCases({
    cases: [
      {
        prompt: currentRow.currentPrompt,
        response: currentRow.currentResponse,
      },
    ],
  });

  const initialScore =
    initialAnalysis[0]?.relevance?.scores?.cos_similarity || 0;
  console.log(`Initial cosine similarity: ${initialScore.toFixed(4)}`);

  // If initial score is already good, don't iterate
  if (initialScore >= 0.7) {
    console.log(
      "✓ Initial score meets threshold (>= 0.7), no iterations needed"
    );
    return {
      ...currentRow,
      cosineScore: initialScore,
      iterations: 0,
      completed: true,
    };
  }

  // Try up to 3 iterations
  for (let iteration = 1; iteration <= 3; iteration++) {
    console.log(`Iteration ${iteration} for ${currentRow.promptId}`);

    // Analyze current prompt/response pair
    const analysis = await analyzeCases({
      cases: [
        {
          prompt: currentRow.currentPrompt,
          response: currentRow.currentResponse,
        },
      ],
    });

    const cosineScore = analysis[0]?.relevance?.scores?.cos_similarity || 0;

    // Create updated row with new iteration data
    currentRow = {
      ...currentRow,
      cosineScore,
      iterations: iteration,
    };

    console.log(`Cosine similarity: ${cosineScore.toFixed(4)}`);

    // If score is good enough, we're done with this row
    if (cosineScore >= 0.7) {
      console.log("✓ Score meets threshold (>= 0.7)");
      return { ...currentRow, completed: true };
    }

    // If we've reached max iterations, flag low score and stop
    if (iteration === 3) {
      console.log("⚠ Max iterations reached, flagging low score");
      return { ...currentRow, lowScoreFlag: true, completed: true };
    }

    // Generate rewrite suggestions
    console.log("Score below threshold, generating rewrite suggestions...");

    let guidance = "";

    // Use human-provided guidance if available
    if (
      currentRow.suggestedPromptChange &&
      currentRow.suggestedPromptChange.trim() !== ""
    ) {
      guidance += `Suggested prompt change: ${currentRow.suggestedPromptChange}\n`;
    }
    if (
      currentRow.suggestedResponseChange &&
      currentRow.suggestedResponseChange.trim() !== ""
    ) {
      guidance += `Suggested response change: ${currentRow.suggestedResponseChange}\n`;
    }

    // If no human guidance, use analysis results as guidance
    if (guidance.trim() === "") {
      const quality = analysis[0]?.quality;
      if (quality?.guidance) {
        guidance = `Analysis feedback: ${quality.guidance}`;
      } else {
        guidance = `The semantic relevance between the prompt and response is low (${cosineScore.toFixed(
          4
        )}). Please improve the alignment between the question and answer.`;
      }
    }

    try {
      const rewrite = await suggestRewrite({
        generatorModel,
        prompt: currentRow.currentPrompt,
        response: currentRow.currentResponse,
        guidance: guidance.trim(),
        styleGuide:
          "The response should provide detailed and informative text content, not URL links. Do not include URLs in the response. Never replace a detailed response with just a URL. If the original response contains useful information, preserve and enhance it rather than replacing it with a link. Always maintain or improve the informational content of the response.",
      });

      // Respect user-provided rewrites - don't override them with AI suggestions
      const newPrompt = currentRow.userRewrittenPrompt
        ? currentRow.currentPrompt
        : rewrite.prompt || currentRow.currentPrompt;

      const newResponse = currentRow.userRewrittenResponse
        ? currentRow.currentResponse
        : rewrite.response || currentRow.currentResponse;

      if (rewrite.prompt && !currentRow.userRewrittenPrompt) {
        console.log("Applying AI-generated prompt rewrite");
      } else if (currentRow.userRewrittenPrompt) {
        console.log("Preserving user-provided prompt rewrite");
      }

      if (rewrite.response && !currentRow.userRewrittenResponse) {
        console.log("Applying AI-generated response rewrite");
      } else if (currentRow.userRewrittenResponse) {
        console.log("Preserving user-provided response rewrite");
      }

      // Create updated row with new prompts/responses and cleared human guidance
      currentRow = {
        ...currentRow,
        currentPrompt: newPrompt,
        currentResponse: newResponse,
        // Clear human guidance after first use to avoid repeating it
        suggestedPromptChange: undefined,
        suggestedResponseChange: undefined,
      };
    } catch (error) {
      console.error(`Error generating rewrite: ${error}`);
      return { ...currentRow, lowScoreFlag: true, completed: true };
    }
  }

  // This shouldn't be reached, but just in case
  return { ...currentRow, completed: true };
}

// Process analysis rows with iterative rewriting using immutable patterns
async function processAnalysisRows(
  analysisRows: AnalysisRow[],
  analyzeCases: ReturnType<typeof makeAnalyzeCases>,
  generatorModel: ReturnType<ReturnType<typeof createOpenAI>["chat"]>
): Promise<AnalysisRow[]> {
  // Process all rows in parallel
  return Promise.all(
    analysisRows.map((row) =>
      processAnalysisRow(row, analyzeCases, generatorModel)
    )
  );
}

// Generate output CSV file using the csv package
async function generateOutputCsv(analysisRows: AnalysisRow[]) {
  const timestamp = Date.now();
  const desktopPath = join(homedir(), "Desktop");
  const outputPath = join(
    desktopPath,
    `mercury_rewrites_results_${timestamp}.csv`
  );

  const headers = [
    "Prompt ID",
    "Original Prompt",
    "Original Response",
    "Final Prompt",
    "Final Response",
    "Final Cosine Similarity",
    "Iterations Used",
    "Low Score Flag",
  ];

  const data = analysisRows.map((row) => [
    row.promptId,
    row.originalPrompt,
    row.originalResponse,
    row.currentPrompt,
    row.currentResponse,
    (row.cosineScore || 0).toFixed(4),
    row.iterations.toString(),
    row.lowScoreFlag ? "true" : "false",
  ]);

  const csvContent = stringify([headers, ...data], {
    quoted_string: true,
    quoted_empty: true,
  });

  writeFileSync(outputPath, csvContent, "utf-8");

  console.log(`\n✓ Results written to: ${outputPath}`);
  console.log(`Processed ${analysisRows.length} rows:`);
  console.log(
    `- Completed successfully: ${
      analysisRows.filter((r) => r.completed && !r.lowScoreFlag).length
    }`
  );
  console.log(
    `- Low score flagged: ${analysisRows.filter((r) => r.lowScoreFlag).length}`
  );
}

async function main() {
  // Get command line argument for CSV file path
  const csvFilePath = process.argv[2];
  if (!csvFilePath) {
    console.error("Usage: npm run mercury-rewrites-qa <path-to-csv-file>");
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

    // Process each CSV row
    const analysisRows: AnalysisRow[] = [];

    for (const csvRow of csvRows) {
      console.log(
        `\nProcessing row: ${
          csvRow.promptId || csvRow.promptText.substring(0, 50)
        }...`
      );

      // Lookup case in database - try by promptId first, then by name
      let caseDoc;
      if (csvRow.promptId && csvRow.promptId.trim() !== "") {
        // Query by ObjectId
        try {
          const caseId = ObjectId.createFromHexString(csvRow.promptId);
          caseDoc = await casesCollection.findOne({ _id: caseId });
          if (!caseDoc) {
            console.error(`Case not found for ID: ${csvRow.promptId}`);
            continue;
          }
        } catch (error) {
          console.error(`Invalid ObjectId: ${csvRow.promptId}`);
          continue;
        }
      } else {
        // Query by name field using promptText
        console.log(
          `No promptId provided, querying by name: "${csvRow.promptText}"`
        );
        caseDoc = await casesCollection.findOne({ name: csvRow.promptText });
        if (!caseDoc) {
          console.error(`Case not found for name: "${csvRow.promptText}"`);
          continue;
        }
      }

      // Extract prompt text from case document
      // The prompt field is an array of objects with content and role
      const promptText =
        caseDoc.prompt
          ?.filter((p: { role: string }) => p.role === "user")
          ?.map((p: { content: string }) => p.content)
          ?.join("\n") || "";

      if (!promptText) {
        console.error(
          `No user prompt found in case: ${
            csvRow.promptId || csvRow.promptText
          }`
        );
        continue;
      }

      // Use suggestedPromptChange as starting point if it exists, otherwise use original
      const startingPrompt =
        csvRow.suggestedPromptChange &&
        csvRow.suggestedPromptChange.trim() !== ""
          ? csvRow.suggestedPromptChange
          : promptText;

      // Use suggestedResponseChange as starting point if it exists, otherwise use original
      const startingResponse =
        csvRow.suggestedResponseChange &&
        csvRow.suggestedResponseChange.trim() !== ""
          ? csvRow.suggestedResponseChange
          : caseDoc.expected || "";

      // Determine if user has provided rewrites
      const userRewrittenPrompt = startingPrompt !== promptText;
      const userRewrittenResponse =
        startingResponse !== (caseDoc.expected || "");

      const analysisRow: AnalysisRow = {
        promptId: csvRow.promptId || caseDoc._id.toString(),
        originalPrompt: promptText,
        originalResponse: caseDoc.expected || "",
        currentPrompt: startingPrompt,
        currentResponse: startingResponse,
        // Clear suggested changes if we've already applied them as starting points
        suggestedPromptChange:
          startingPrompt === promptText
            ? csvRow.suggestedPromptChange || undefined
            : undefined,
        suggestedResponseChange:
          startingResponse === (caseDoc.expected || "")
            ? csvRow.suggestedResponseChange || undefined
            : undefined,
        iterations: 0,
        lowScoreFlag: false,
        completed: false,
        userRewrittenPrompt,
        userRewrittenResponse,
      };

      // Log what we're starting with
      if (startingPrompt !== promptText) {
        console.log("Starting with rewritten prompt from CSV");
      }
      if (startingResponse !== (caseDoc.expected || "")) {
        console.log("Starting with rewritten response from CSV");
      }

      analysisRows.push(analysisRow);
    }

    console.log(
      `\nStarting iterative analysis for ${analysisRows.length} cases...`
    );

    // Iterative analysis and rewriting
    const processedRows = await processAnalysisRows(
      analysisRows,
      analyzeCases,
      generatorModel
    );

    // Generate output CSV
    await generateOutputCsv(processedRows);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
