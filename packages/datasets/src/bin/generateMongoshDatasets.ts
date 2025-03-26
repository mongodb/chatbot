import "dotenv/config";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { executeMongoshQuery } from "mongodb-rag-core/executeCode";
import * as fs from "fs";
import * as path from "path";
import PromisePool from "@supercharge/promise-pool";
import { OpenAI } from "mongodb-rag-core/openai";
import { BRAINTRUST_ENV_VARS, assertEnvVars } from "mongodb-rag-core";
import { DATABASE_NL_QUERIES } from "../EnvVars";
import { generateAnnotatedDatabaseInfo } from "../treeGeneration/databaseNlQueries/databaseNodes/generateAnnotatedDatabaseInfo";
import { generateDatabaseExecutionResult } from "../treeGeneration/databaseNlQueries/databaseNodes/generateDatabaseExecutionResult";
import { generateDatabaseUsers } from "../treeGeneration/databaseNlQueries/databaseNodes/generateDatabaseUsers";
import { generateMongoshCode } from "../treeGeneration/databaseNlQueries/databaseNodes/generateMongoshCode";
import { generateNaturalLanguageQueries } from "../treeGeneration/databaseNlQueries/databaseNodes/generateNaturalLanguageQueries";
import { generateDatabaseUseCases } from "../treeGeneration/databaseNlQueries/databaseNodes/generateUseCases";
import { makeMongoDbNodeStore } from "../treeGeneration/MongoDbNodeStore";
import { LlmOptions } from "../treeGeneration/databaseNlQueries/databaseNodes/LlmOptions";
import { datasetDatabases } from "../treeGeneration/databaseNlQueries/datasetDatabases";
import { findMostFrequentAndPerformantDatabaseExecutionResult } from "../treeGeneration/databaseNlQueries/findMostFrequentAndPerformantDatabaseExecutionResult";
import { generateDatabaseNlQueryDatasetEntry } from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";

const DEFAULT_CONCURRENCY = 10;

/**
  Magic number to specify the max results array size to evaluate.
 */
const MAX_RESULT_ARRAY_SIZE = 20;

type LlmGenerationConfig = {
  database: {
    llmConfig: LlmOptions;
  };
  users: {
    llmConfig: LlmOptions;
    numGenerations: number;
  };
  useCases: {
    llmConfig: LlmOptions;
    numGenerations: number;
    concurrency: number;
  };
  nlQueries: {
    llmConfig: LlmOptions;
    numGenerations: number;
    concurrency: number;
  };
  dbQueries: {
    llmConfig: LlmOptions;
    numGenerations: number;
    concurrency: number;
  };
  dbExecutions: {
    concurrency: number;
  };
};
interface GenerateMongoshDatasetParams {
  persistence: {
    mongoClient: MongoClient;
    databaseName: string;
    collectionName: string;
  };
  dataset: {
    databaseName: string;
    numSamplesPerCollection: number;
    connectionUri: string;
    latestDate: Date;
    mongoClient: MongoClient;
  };
  llmConfigs: LlmGenerationConfig;
  datasetUuid: string;
  writeToFile: {
    dataOutDir: string;
  };
  maxResultsArraySize?: number;
}

async function generateMongoshDataset({
  persistence,
  dataset,
  llmConfigs,
  datasetUuid,
  writeToFile,
  maxResultsArraySize = MAX_RESULT_ARRAY_SIZE,
}: GenerateMongoshDatasetParams) {
  console.log(`Generating dataset for database ${dataset.databaseName}`);
  const referenceAnswersOutputPath = path.resolve(
    writeToFile.dataOutDir,
    `referenceAnswers.dataset_${datasetUuid}.jsonl`
  );
  // Write out each DB's dataset to a separate file
  const textToMqlOutputPath = path.resolve(
    writeToFile.dataOutDir,
    `text_to_mongosh.${dataset.databaseName}.dataset_${datasetUuid}.jsonl`
  );

  console.log(
    `Writing data out to DB ${persistence.databaseName}.${persistence.collectionName}`
  );

  const nodeStore = makeMongoDbNodeStore(persistence);

  console.log(`Generating database info for database ${dataset.databaseName}`);
  const databaseInfoNode = await generateAnnotatedDatabaseInfo({
    mongoDb: dataset,
    llm: llmConfigs.database.llmConfig,
    latestDate: dataset.latestDate,
  });
  await nodeStore.storeNodes({ nodes: [databaseInfoNode] });

  // Generate database users
  console.log("Generating database users...");
  const userNodes = await generateDatabaseUsers(
    databaseInfoNode,
    llmConfigs.users.llmConfig,
    llmConfigs.users.numGenerations
  );
  await nodeStore.storeNodes({ nodes: userNodes });

  console.log(`Generated ${userNodes.length} database users`);

  // Generate use cases for each user
  console.log("Generating use cases for each user...");
  const { results: useCaseNodesByUser } = await PromisePool.for(userNodes)
    .withConcurrency(llmConfigs.useCases.concurrency ?? 5)
    .process(async (userNode) => {
      const useCases = await generateDatabaseUseCases(
        userNode,
        llmConfigs.useCases.llmConfig,
        llmConfigs.useCases.numGenerations
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
  const { results: nlQueryNodesByUseCase } = await PromisePool.withConcurrency(
    llmConfigs.nlQueries.concurrency ?? DEFAULT_CONCURRENCY
  )
    .for(useCaseNodes)
    .handleError((err) => {
      console.error(err);
    })
    .process(async (useCaseNode) => {
      const nlQueries = await generateNaturalLanguageQueries(
        useCaseNode,
        llmConfigs.nlQueries.llmConfig,
        llmConfigs.nlQueries.numGenerations
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
  const { results: dbQCodeNodesByNlQuery } = await PromisePool.for(nlQueryNodes)
    .withConcurrency(llmConfigs.dbQueries.concurrency ?? DEFAULT_CONCURRENCY)
    .process(async (nlQueryNode) => {
      const dbCodeNodes = await generateMongoshCode(
        nlQueryNode,
        llmConfigs.dbQueries.llmConfig,
        llmConfigs.dbQueries.numGenerations
      );
      await nodeStore.storeNodes({ nodes: dbCodeNodes });

      console.log(
        `Generated ${dbCodeNodes.length} DB queries for NL query: ${nlQueryNode.data.query}`
      );
      return dbCodeNodes;
    });
  for (const dbCodeNodes of dbQCodeNodesByNlQuery) {
    const { results: dbExecutions } = await PromisePool.for(dbCodeNodes)
      .withConcurrency(
        llmConfigs.dbExecutions.concurrency ?? DEFAULT_CONCURRENCY
      )
      .process(async (dbCodeNode) => {
        const dbExecution = await generateDatabaseExecutionResult({
          database: {
            name: dataset.databaseName,
            uri: dataset.connectionUri,
          },
          generatedQuery: dbCodeNode,
          executor: executeMongoshQuery,
        });
        if (
          Array.isArray(dbExecution.data.result) &&
          dbExecution.data.result?.length > maxResultsArraySize
        ) {
          throw new Error("Result array is too large to process.");
        }
        console.log(
          `Generated DB execution: ${dbExecution.data.result
            ?.toString()
            .slice(0, 20)} ...`
        );
        return dbExecution;
      });
    console.log(`Generated ${dbExecutions.length} DB executions.`);

    try {
      // Find the most frequent and performant database execution result
      const { fastestMostFrequentIndex } =
        findMostFrequentAndPerformantDatabaseExecutionResult(
          dbExecutions.map((node) => node.data)
        );
      if (
        fastestMostFrequentIndex !== null &&
        dbExecutions[fastestMostFrequentIndex].data.result !== null
      ) {
        const dbResult = dbExecutions[fastestMostFrequentIndex].data.result;
        if (
          (Array.isArray(dbResult) && dbResult.length > 0) ||
          !Array.isArray(dbResult)
        ) {
          dbExecutions[fastestMostFrequentIndex].data.isReferenceAnswer = true;
        }
      }

      await nodeStore.storeNodes({ nodes: dbExecutions });
      console.log(`Writing data out to ${textToMqlOutputPath}`);
      for (const dbExecution of dbExecutions) {
        const textToMqlDatasetEntry =
          generateDatabaseNlQueryDatasetEntry(dbExecution);
        fs.appendFileSync(
          textToMqlOutputPath,
          JSON.stringify(textToMqlDatasetEntry) + "\n"
        );
        if (dbExecution.data.isReferenceAnswer) {
          fs.appendFileSync(
            referenceAnswersOutputPath,
            JSON.stringify(textToMqlDatasetEntry) + "\n"
          );
        }
      }
    } catch (error) {
      console.error(error);
    }

    console.log(
      `Successfully wrote ${dbCodeNodes.length} nodes to ${textToMqlOutputPath}`
    );
  }
}

async function main() {
  // Set up
  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_ENDPOINT,
    MONGODB_TEXT_TO_CODE_CONNECTION_URI,
  } = assertEnvVars({
    ...BRAINTRUST_ENV_VARS,
    ...DATABASE_NL_QUERIES,
  });
  const mongoClient = new MongoClient(MONGODB_TEXT_TO_CODE_CONNECTION_URI);

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
    model: "gpt-4o-mini",
    temperature: 0.5,
    seed: 42,
  };

  // One point to control generations at each level.
  // Useful for debugging.
  const config = {
    database: {
      llmConfig: {
        ...llmOptions,
        model: "gpt-4o",
        temperature: 0,
        max_completion_tokens: 2000,
      },
    },
    users: { numGenerations: 8, llmConfig: llmOptions },
    useCases: { numGenerations: 8, llmConfig: llmOptions, concurrency: 10 },
    nlQueries: { numGenerations: 8, llmConfig: llmOptions, concurrency: 10 },
    dbQueries: {
      numGenerations: 16,
      llmConfig: { ...llmOptions },
      concurrency: 25,
    },
    dbExecutions: {
      concurrency: 20,
    },
  } as const satisfies LlmGenerationConfig;

  // Runnit
  try {
    const now = Date.now();
    await mongoClient.connect();
    for (const db of datasetDatabases) {
      await generateMongoshDataset({
        persistence: {
          mongoClient,
          databaseName: "mongosh_datasets",
          collectionName: db.name,
        },
        dataset: {
          databaseName: db.name,
          numSamplesPerCollection: 2,
          mongoClient,
          latestDate: db.latestDate,
          connectionUri: MONGODB_TEXT_TO_CODE_CONNECTION_URI,
        },
        llmConfigs: config,
        datasetUuid: now.toString(),
        writeToFile: {
          dataOutDir,
        },
      });
    }
  } finally {
    await mongoClient.close();
  }
}
main();
