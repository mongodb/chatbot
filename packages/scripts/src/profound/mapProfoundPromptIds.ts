import path from "path";
import fs from "fs";
import os from "os";
import { getEnv } from "mongodb-rag-core";
import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { ProfoundApi } from "./profoundAPI";

const env = getEnv({
  required: [
    // Mercury Database
    "MERCURY_CONNECTION_URI",
    "MERCURY_DATABASE_NAME",
    // Profound API
    "PROFOUND_API_KEY",
    "PROFOUND_CATALOG_ID_EDU",
  ],
  optional: {
    MERCURY_PROMPTS_COLLECTION: "llm_cases_new",
  },
});

interface LlmCase {
  _id: ObjectId;
  name: string;
  // Add other fields as needed
}

interface FailureCase {
  _id: ObjectId;
  name: string;
  reason: string;
}

const profoundAPI = new ProfoundApi({ apiKey: env.PROFOUND_API_KEY });

export async function main(args: { outputDir?: string } = {}) {
  const client = new MongoClient(env.MERCURY_CONNECTION_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(env.MERCURY_DATABASE_NAME);
    const llmCasesCollection = db.collection<LlmCase>(
      env.MERCURY_PROMPTS_COLLECTION
    );

    // Step 1: Query the llm_cases_new collection to get all documents
    console.log("Fetching all documents from llm_cases_new collection...");
    const llmCases = await llmCasesCollection.find({}).toArray();
    console.log(
      `Found ${llmCases.length} documents in llm_cases_new collection`
    );

    if (llmCases.length === 0) {
      console.log("No documents found in llm_cases_new collection. Exiting.");
      return;
    }

    // Step 2: Call Profound API to get all answers and create prompt->prompt_id map
    console.log("Fetching answers from Profound API...");

    // Get a wide date range to capture all possible answers
    // Using a very broad range to ensure we get all historical data
    const startDate = "2020-01-01";
    const endDate = new Date().toISOString().split("T")[0]; // Today's date

    const response = await profoundAPI.getAnswers({
      body: {
        start_date: startDate,
        end_date: endDate,
        include: {
          prompt_id: true,
          run_id: true,
        },
      },
      categoryId: env.PROFOUND_CATALOG_ID_EDU,
    });

    console.log(`Retrieved ${response.data.length} answers from Profound API`);

    // Step 3: Create a map from prompt text to prompt_id
    const promptToPromptIdMap = new Map<string, string>();

    response.data.forEach((answer) => {
      if (answer.prompt && answer.prompt_id) {
        promptToPromptIdMap.set(answer.prompt, answer.prompt_id);
      }
    });

    console.log(
      `Created map with ${promptToPromptIdMap.size} unique prompt->prompt_id mappings`
    );

    // Step 4: Match llm_cases_new documents to Profound prompts
    const successfulMatches: Array<{
      _id: ObjectId;
      profoundPromptId: string;
    }> = [];
    const failures: FailureCase[] = [];

    console.log("Matching llm_cases_new documents to Profound prompts...");

    llmCases.forEach((llmCase) => {
      const profoundPromptId = promptToPromptIdMap.get(llmCase.name);

      if (profoundPromptId) {
        successfulMatches.push({
          _id: llmCase._id,
          profoundPromptId: profoundPromptId,
        });
      } else {
        failures.push({
          _id: llmCase._id,
          name: llmCase.name,
          reason: "No matching prompt found in Profound API response",
        });
      }
    });

    console.log(`\n=== Matching Results ===`);
    console.log(`Total documents processed: ${llmCases.length}`);
    console.log(`Successful matches: ${successfulMatches.length}`);
    console.log(`Failed matches: ${failures.length}`);

    // Step 5: Update the llm_cases_new collection with profoundPromptId values
    if (successfulMatches.length > 0) {
      console.log(
        "\nUpdating llm_cases_new collection with profoundPromptId values..."
      );

      const bulkUpdates = successfulMatches.map((match) => ({
        updateOne: {
          filter: { _id: match._id },
          update: {
            $set: {
              "metadata.profoundPromptId": match.profoundPromptId,
            },
          },
        },
      }));

      const updateResult = await llmCasesCollection.bulkWrite(bulkUpdates);
      console.log(
        `Successfully updated ${updateResult.modifiedCount} documents`
      );

      if (updateResult.modifiedCount !== successfulMatches.length) {
        console.warn(
          `Warning: Expected to update ${successfulMatches.length} documents but only updated ${updateResult.modifiedCount}`
        );
      }
    }

    // Step 6: Write failure cases to file
    if (args.outputDir && failures.length > 0) {
      const outputDir = args.outputDir;
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const failuresFile = path.join(
        outputDir,
        `profound-mapping-failures-${
          new Date().toISOString().split("T")[0]
        }.json`
      );
      fs.writeFileSync(failuresFile, JSON.stringify(failures, null, 2));
      console.log(`\nFailure cases written to: ${failuresFile}`);
    } else if (failures.length > 0) {
      console.log("\nFailure cases (document _ids):");
      failures.forEach((failure) => {
        console.log(`  - ${failure._id}: ${failure.reason}`);
      });
    }

    console.log("\n=== Script completed successfully ===");
  } catch (error) {
    console.error("Error occurred:", error);
    throw error;
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// CLI execution
if (require.main === module) {
  const outputDir =
    process.argv[2] ||
    path.join(os.homedir(), "Desktop/mercury-results/profound-mapping");

  main({ outputDir })
    .then(() => {
      console.log("Script execution completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script execution failed:", error);
      process.exit(1);
    });
}
