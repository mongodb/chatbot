import "dotenv/config";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { executeMongoshQuery } from "mongodb-rag-core/executeCode";
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
import { generateMongoshCode } from "./generateMongoshCode";
import { makeMongoDbNodeStore } from "../MongoDbNodeStore";
import { generateDatabaseExecutionResult } from "./generateDatabaseExecutionResult";

const nlQueryOutputPath = path.resolve(__dirname, "nl_queries.jsonl");

// Clear the file if it exists
if (fs.existsSync(nlQueryOutputPath)) {
  fs.unlinkSync(nlQueryOutputPath);
}

const textToMqlOutputPath = path.resolve(__dirname, "text_to_mql.jsonl");

// Clear the file if it exists
if (fs.existsSync(textToMqlOutputPath)) {
  fs.unlinkSync(textToMqlOutputPath);
}

// One point to control how many generations at each level.
// Useful for debugging.
const numGenerations = {
  users: 8,
  useCases: 3,
  nlQueries: 3,
  dbQueries: 8,
};

describe("End-to-end NL query generation pipeline", () => {
  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_ENDPOINT,
    MONGODB_TEXT_TO_CODE_CONNECTION_URI,
  } = assertEnvVars({
    ...BRAINTRUST_ENV_VARS,
    ...DATABASE_NL_QUERIES,
  });
  jest.setTimeout(600000 * 1000); // loooong timeout for whole pipeline

  const mongoClient = new MongoClient(MONGODB_TEXT_TO_CODE_CONNECTION_URI);
  const nodeStore = makeMongoDbNodeStore({
    mongoClient,
    collectionName: "nodes",
    databaseName: "db_to_code",
  });

  beforeAll(async () => {
    await mongoClient.connect();
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  it("should generate database users, use cases, and NL queries", async () => {
    const databaseName = "sample_mflix";
    console.log(`Generating database info for database ${databaseName}`);
    const databaseInfoNode = await generateAnnotatedDatabaseInfo({
      mongoDb: {
        databaseName,
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
    await nodeStore.storeNodes({ nodes: [databaseInfoNode] });

    // Generate database users
    console.log("Generating database users...");
    const userNodes = await generateDatabaseUsers(
      databaseInfoNode,
      sampleLlmOptions,
      numGenerations.users
    );
    await nodeStore.storeNodes({ nodes: userNodes });

    console.log(`Generated ${userNodes.length} database users`);

    // Generate use cases for each user
    console.log("Generating use cases for each user...");
    const { results: useCaseNodesByUser } = await PromisePool.for(userNodes)
      .withConcurrency(5)
      .process(async (userNode) => {
        const useCases = await generateDatabaseUseCases(
          userNode,
          sampleLlmOptions,
          numGenerations.useCases
        );
        await nodeStore.storeNodes({ nodes: useCases });
        console.log(
          `Generated ${useCases.length} use cases for ${userNode.data.name}, ${userNode.data.jobTitle}`
        );
        return useCases;
      });

    const useCaseNodes = useCaseNodesByUser.flat();
    console.log(`Created ${useCaseNodes.length} use cases.`);

    console.log("Generating natural language queries for each use case...");

    // Process use cases in parallel with limited concurrency
    const { results: nlQueryNodesByUseCase } =
      await PromisePool.withConcurrency(10)
        .for(useCaseNodes)
        .handleError((err) => {
          console.error(err);
        })
        .process(async (useCaseNode) => {
          const nlQueries = await generateNaturalLanguageQueries(
            useCaseNode,
            sampleLlmOptions,
            numGenerations.nlQueries
          );
          await nodeStore.storeNodes({
            nodes: nlQueries,
          });
          console.log(
            `Generated ${nlQueries.length} NL queries for use case: ${useCaseNode.data.title}`
          );

          for (const nlQuery of nlQueries) {
            fs.appendFileSync(
              nlQueryOutputPath,
              JSON.stringify(nlQuery.data) + "\n"
            );
          }
          return nlQueries;
        });
    const nlQueryNodes = nlQueryNodesByUseCase.flat();

    console.log(
      `Successfully wrote ${nlQueryNodes.length} nodes to ${nlQueryOutputPath}`
    );

    // Generate triplets for the NL queries
    console.log("Generating query nodes for the NL queries...");
    const { results: dbQCodeNodesByNlQuery } = await PromisePool.for(
      nlQueryNodes
    )
      .withConcurrency(10)
      .process(async (nlQueryNode) => {
        const dbCodeNodes = await generateMongoshCode(
          nlQueryNode,
          sampleLlmOptions,
          numGenerations.dbQueries
        );
        await nodeStore.storeNodes({ nodes: dbCodeNodes });

        console.log(
          `Generated ${dbCodeNodes.length} DB queries for NL query: ${nlQueryNode.data.query}`
        );
        return dbCodeNodes;
      });
    const dbCodeNodes = dbQCodeNodesByNlQuery.flat();
    const { results: dbExecutions } = await PromisePool.for(dbCodeNodes)
      .withConcurrency(10)
      .process(async (dbCodeNode) => {
        const dbExecution = await generateDatabaseExecutionResult({
          database: {
            name: databaseName,
            uri: MONGODB_TEXT_TO_CODE_CONNECTION_URI,
          },
          generatedQuery: dbCodeNode,
          executor: executeMongoshQuery,
        });
        console.log(
          `Generated DB execution: ${dbExecution.data.result
            ?.toString()
            .slice(0, 20)} ...`
        );
        return dbExecution;
      });
    // TODO: why hanging up here??
    console.log(`Generated ${dbExecutions.length} DB executions.`);
    await nodeStore.storeNodes({ nodes: dbExecutions });
    console.log(`Writing data out to ${textToMqlOutputPath}`);
    for (const dbExecution of dbExecutions) {
      const textToMqlDatasetEntry = {
        dbQuery: dbExecution.parent.data.code,
        language: dbExecution.parent.data.language,
        nlQuery: dbExecution.parent.parent.data.query,
        complexity: dbExecution.parent.parent.data.complexity,
        databaseName: dbExecution.parent.parent.parent.parent.data.name,
        ...dbExecution.data,
      };
      fs.appendFileSync(
        textToMqlOutputPath,
        JSON.stringify(textToMqlDatasetEntry) + "\n"
      );
    }

    console.log(
      `Successfully wrote ${dbCodeNodes.length} nodes to ${textToMqlOutputPath}`
    );
  });
});
