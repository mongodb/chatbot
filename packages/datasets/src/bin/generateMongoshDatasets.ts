import "dotenv/config";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { executeMongoshQuery } from "mongodb-rag-core/executeCode";
import * as fs from "fs";
import * as path from "path";
import PromisePool from "@supercharge/promise-pool";
import { OpenAI } from "mongodb-rag-core/openai";
import { BRAINTRUST_ENV_VARS, assertEnvVars } from "mongodb-rag-core";
import { DATABASE_NL_QUERIES } from "../EnvVars";
import { generateAnnotatedDatabaseInfo } from "../treeGeneration/databaseNlQueries/generateAnnotatedDatabaseInfo";
import { generateDatabaseExecutionResult } from "../treeGeneration/databaseNlQueries/generateDatabaseExecutionResult";
import { generateDatabaseUsers } from "../treeGeneration/databaseNlQueries/generateDatabaseUsers";
import { generateMongoshCode } from "../treeGeneration/databaseNlQueries/generateMongoshCode";
import { generateNaturalLanguageQueries } from "../treeGeneration/databaseNlQueries/generateNaturalLanguageQueries";
import { generateDatabaseUseCases } from "../treeGeneration/databaseNlQueries/generateUseCases";
import { makeMongoDbNodeStore } from "../treeGeneration/MongoDbNodeStore";
import { LlmOptions } from "../treeGeneration/databaseNlQueries/LlmOptions";
import { datasetDatabases } from "../treeGeneration/databaseNlQueries/datasetDatabases";

const {
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
  MONGODB_TEXT_TO_CODE_CONNECTION_URI,
} = assertEnvVars({
  ...BRAINTRUST_ENV_VARS,
  ...DATABASE_NL_QUERIES,
});

const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

// Validate that dataOutDir exists. Create if it doesn't
if (!fs.existsSync(dataOutDir)) {
  fs.mkdirSync(dataOutDir, { recursive: true });
  console.log(`Created directory: ${dataOutDir}`);
}

const llmOptions: LlmOptions = {
  openAiClient: new OpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  }),
  model: "gpt-4o",
  temperature: 0.5,
  seed: 42,
};

// One point to control generations at each level.
// Useful for debugging.
const config = {
  users: { numGenerations: 8, llmConfig: llmOptions },
  useCases: { numGenerations: 3, llmConfig: llmOptions },
  nlQueries: { numGenerations: 3, llmConfig: llmOptions },
  dbQueries: { numGenerations: 8, llmConfig: llmOptions },
} as const satisfies Record<
  string,
  { numGenerations: number; llmConfig: LlmOptions }
>;

async function generateMongoshDataset(
  mongoClient: MongoClient,
  databaseName: string
) {
  const textToMqlOutputPath = path.resolve(
    dataOutDir,
    `text_to_mql_${databaseName}_${Date.now()}.jsonl`
  );

  const nodeStore = makeMongoDbNodeStore({
    mongoClient,
    collectionName: "nodes",
    databaseName: "db_to_code",
  });

  await mongoClient.connect();

  try {
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
      config.users.llmConfig,
      config.users.numGenerations
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
          config.useCases.llmConfig,
          config.useCases.numGenerations
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
            config.nlQueries.llmConfig,
            config.nlQueries.numGenerations
          );
          await nodeStore.storeNodes({
            nodes: nlQueries,
          });
          console.log(
            `Generated ${nlQueries.length} NL queries for use case: ${useCaseNode.data.title}`
          );

          return nlQueries;
        });
    const nlQueryNodes = nlQueryNodesByUseCase.flat();

    // Generate triplets for the NL queries
    console.log("Generating query nodes for the NL queries...");
    const { results: dbQCodeNodesByNlQuery } = await PromisePool.for(
      nlQueryNodes
    )
      .withConcurrency(10)
      .process(async (nlQueryNode) => {
        const dbCodeNodes = await generateMongoshCode(
          nlQueryNode,
          config.dbQueries.llmConfig,
          config.dbQueries.numGenerations
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
  } finally {
    await mongoClient.close();
  }
}

async function main() {
  const mongoClient = new MongoClient(MONGODB_TEXT_TO_CODE_CONNECTION_URI);
  try {
    await mongoClient.connect();
    for (const databaseName of datasetDatabases) {
      await generateMongoshDataset(mongoClient, databaseName);
    }
  } finally {
    await mongoClient.close();
  }
}
main();
