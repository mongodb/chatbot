import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import * as fs from "fs";
import * as path from "path";
import PromisePool from "@supercharge/promise-pool";
import { generateDatabaseUsers } from "./generateDatabaseUsers";
import { generateDatabaseUseCases } from "./generateUseCases";
import { generateNaturalLanguageQueries } from "./generateNaturalLanguageQueries";
import { generateAnnotatedDatabaseInfo } from "./generateAnnotatedDatabaseInfo";
import { OpenAI } from "mongodb-rag-core/openai";
import { BRAINTRUST_ENV_VARS, assertEnvVars } from "mongodb-rag-core";
import { DATABASE_NL_QUERIES } from "../../EnvVars";
import { sampleLlmOptions } from "./sampleData";

describe("End-to-end NL query generation pipeline", () => {
  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_ENDPOINT,
    MONGODB_TEXT_TO_CODE_CONNECTION_URI,
  } = assertEnvVars({
    ...BRAINTRUST_ENV_VARS,
    ...DATABASE_NL_QUERIES,
  });
  jest.setTimeout(60000 * 1000); // loooong timeout for whole pipeline

  const mongoClient = new MongoClient(MONGODB_TEXT_TO_CODE_CONNECTION_URI);
  beforeAll(async () => {
    await mongoClient.connect();
  });
  afterAll(async () => {
    await mongoClient.close();
  });

  it("should generate database users, use cases, and NL queries", async () => {
    console.log("Generating database info...");
    const databaseInfoNode = await generateAnnotatedDatabaseInfo({
      mongoDb: {
        databaseName: "sample_mflix",
        mongoClient,
        numSamplesPerCollection: 2,
      },
      llm: {
        model: "gpt-4o",
        openAiClient: new OpenAI({
          baseURL: BRAINTRUST_ENDPOINT,
          apiKey: BRAINTRUST_API_KEY,
        }),
        temperature: 0,
        max_completion_tokens: 2000,
      },
      latestDate: new Date("2017-09-13T00:37:11.000+00:00"),
    });

    // Step 2: Generate database users
    console.log("Generating database users...");
    const userNodes = await generateDatabaseUsers(
      databaseInfoNode,
      sampleLlmOptions
    );
    console.log(`Generated ${userNodes.length} database users`);

    // Step 3: Generate use cases for each user
    console.log("Generating use cases for each user...");
    const { results: useCaseNodesByUser } = await PromisePool.for(userNodes)
      .withConcurrency(5)
      .process(async (userNode) => {
        const useCases = await generateDatabaseUseCases(
          userNode,
          sampleLlmOptions
        );
        console.log(
          `Generated ${useCases.length} use cases for ${userNode.data.name}`
        );
        return useCases;
      });

    const useCaseNodes = useCaseNodesByUser.flat();

    const allNodes: unknown[] = [];
    // Step 4: Generate NL queries for each use case
    console.log("Generating natural language queries for each use case...");

    // Step 5: Write all nodes to a JSONL file
    const outputPath = path.resolve(__dirname, "nl_queries.jsonl");

    // Clear the file if it exists
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    // Process use cases in parallel with limited concurrency
    await PromisePool.withConcurrency(10)
      .for(useCaseNodes)
      .process(async (useCaseNode) => {
        try {
          const nlQueries = await generateNaturalLanguageQueries(
            useCaseNode,
            sampleLlmOptions
          );
          console.log(
            `Generated ${nlQueries.length} NL queries for use case: ${useCaseNode.data.title}`
          );

          // Add NL query nodes to the collection
          nlQueries.forEach((node) => {
            allNodes.push({
              type: "natural_language_query",
              _id: node._id.toString(),
              parent: node.parent._id.toString(),
              data: node.data,
              updated: node.updated,
            });
          });
          // Write each node as a separate line in JSONL format
          allNodes.forEach((node) => {
            fs.appendFileSync(outputPath, JSON.stringify(node) + "\n");
          });
        } catch (error) {
          console.error(
            `Error generating NL queries for use case ${useCaseNode.data.title}:`,
            error
          );
        }
      });

    console.log(`Successfully wrote ${allNodes.length} nodes to ${outputPath}`);

    // Basic assertions
    expect(userNodes.length).toBeGreaterThan(0);
    expect(useCaseNodes.length).toBeGreaterThan(0);
    expect(allNodes.length).toBeGreaterThan(0);
  });
});
