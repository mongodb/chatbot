import "dotenv/config";
import { MongoClient } from "mongodb-rag-core/mongodb";
import {
  makeExecuteEjsonAggregationQuery,
  isReasonableResult,
  LlmOptions,
} from "mongodb-rag-core/executeCode";
import * as fs from "fs";
import * as path from "path";
import PromisePool from "@supercharge/promise-pool";
import { makeOpenAiClient } from "../openAi";
import { assertEnvVars } from "mongodb-rag-core";
import { DATABASE_NL_QUERIES } from "../EnvVars";
import { generateAnnotatedDatabaseInfoNode } from "../treeGeneration/databaseNlQueries/databaseNodes/generateAnnotatedDatabaseInfoNode";
import { generateDatabaseExecutionResult } from "../treeGeneration/databaseNlQueries/databaseNodes/generateDatabaseExecutionResult";
import { generateDatabaseUsers } from "../treeGeneration/databaseNlQueries/databaseNodes/generateDatabaseUsers";
import { generateAtlasSearchCode } from "../treeGeneration/databaseNlQueries/databaseNodes/generateAtlasSearchCode";
import { generateNaturalLanguageAtlasSearchQueries } from "../treeGeneration/databaseNlQueries/databaseNodes/generateNaturalLanguageQueries";
import { generateDatabaseUseCases } from "../treeGeneration/databaseNlQueries/databaseNodes/generateUseCases";
import { findMostFrequentAndPerformantDatabaseExecutionResult } from "../treeGeneration/databaseNlQueries/findMostFrequentAndPerformantDatabaseExecutionResult";
import {
  DatabaseNlQueryDatasetEntry,
  generateDatabaseNlQueryDatasetEntryAtlasSearch,
} from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";
import { initLogger } from "mongodb-rag-core/braintrust";
import {
  DatabaseUseCase,
  NaturalLanguageQuery,
} from "../treeGeneration/databaseNlQueries/databaseNodes/nodeTypes";

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
    concurrency: number;
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

interface GenerateAtlasSearchDatasetParams {
  persistence: {
    mongoClient: MongoClient;
    databaseName: string;
    collectionName: string;
  };
  dataset: {
    databaseName: string;
    collectionName: string;
    numSamplesPerCollection: number;
    latestDate: Date;
    mongoClient: MongoClient;
    searchIndexes: {
      [collectionName: string]: string[];
    };
  };
  llmConfigs: LlmGenerationConfig;
  datasetUuid: string;
  writeToFile: {
    dataOutDir: string;
  };
  maxResultsArraySize?: number;
}

async function generateAtlasSearchDataset({
  persistence,
  dataset,
  llmConfigs,
  datasetUuid,
  writeToFile,
  maxResultsArraySize = MAX_RESULT_ARRAY_SIZE,
}: GenerateAtlasSearchDatasetParams) {
  console.log(
    `Generating Atlas Search dataset for database ${dataset.databaseName}`
  );
  const datasetOutDir = path.resolve(writeToFile.dataOutDir, datasetUuid);
  if (!fs.existsSync(datasetOutDir)) {
    fs.mkdirSync(datasetOutDir, { recursive: true });
    console.log(`Created directory: ${datasetOutDir}`);
  }
  const referenceAnswersOutputPath = path.resolve(
    datasetOutDir,
    `referenceAnswers.atlas_search_dataset_${datasetUuid}.jsonl`
  );

  const executeAtlasSearchQuery = makeExecuteEjsonAggregationQuery({
    mongoClient: dataset.mongoClient,
  });

  console.log(
    `Writing data out to DB ${persistence.databaseName}.${persistence.collectionName}`
  );

  console.log(`Generating database info for database ${dataset.databaseName}`);

  const databaseInfoNode = await generateAnnotatedDatabaseInfoNode({
    mongoDb: dataset,
    llmOptions: llmConfigs.database.llmConfig,
    latestDate: dataset.latestDate,
    openAiClient: makeOpenAiClient(),
  });
  fs.writeFileSync(
    path.resolve(datasetOutDir, "databaseInfo.json"),
    JSON.stringify(databaseInfoNode.data, null, 2)
  );

  // Generate database users
  console.log("Generating database users...");
  const userNodes = await generateDatabaseUsers(
    databaseInfoNode,
    llmConfigs.users.llmConfig,
    llmConfigs.users.numGenerations
  );
  fs.writeFileSync(
    path.resolve(datasetOutDir, "userNodes.json"),
    JSON.stringify(
      userNodes.map((node) => node.data),
      null,
      2
    )
  );

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
      console.log(
        `Generated ${useCases.length} use cases for ${userNode.data.name}, ${userNode.data.role}`
      );
      return useCases;
    });

  const sampleUseCases: Record<string, DatabaseUseCase[]> = {};
  for (const userUseCaseNodes of useCaseNodesByUser) {
    sampleUseCases[userUseCaseNodes[0].parent.data.name] = userUseCaseNodes.map(
      (node) => node.data
    );
  }
  const useCaseNodes = useCaseNodesByUser.flat();
  console.log(`Created ${useCaseNodes.length} use cases.`);

  fs.writeFileSync(
    path.resolve(datasetOutDir, "useCaseNodes.json"),
    JSON.stringify(sampleUseCases, null, 2)
  );

  console.log(
    "Generating natural language queries for each use case (Atlas Search specific)..."
  );

  // Process use cases in parallel with limited concurrency - using Atlas Search specific generation
  const { results: nlQueryNodesByUseCase } = await PromisePool.withConcurrency(
    llmConfigs.nlQueries.concurrency ?? DEFAULT_CONCURRENCY
  )
    .for(useCaseNodes)
    .handleError((err) => {
      console.error(err);
    })
    .process(async (useCaseNode) => {
      const nlQueries = await generateNaturalLanguageAtlasSearchQueries(
        useCaseNode,
        llmConfigs.nlQueries.llmConfig,
        llmConfigs.nlQueries.numGenerations
      );

      console.log(
        `Generated ${nlQueries.length} Atlas Search NL queries for use case: ${useCaseNode.data.title}`
      );

      return nlQueries;
    });
  const nlQueryNodes = nlQueryNodesByUseCase.flat();
  const nlQueriesOut: Partial<
    Record<string, Partial<Record<string, NaturalLanguageQuery[]>>>
  > = {};
  for (const nlQueryNode of nlQueryNodes) {
    const useCaseTitle = nlQueryNode.parent.data.title;
    const userTitle = nlQueryNode.parent.parent.data.name;

    if (!nlQueriesOut[userTitle]) {
      nlQueriesOut[userTitle] = {};
    }
    if (!nlQueriesOut[userTitle]![useCaseTitle]) {
      nlQueriesOut[userTitle]![useCaseTitle] = [];
    }
    nlQueriesOut[userTitle]![useCaseTitle]!.push(nlQueryNode.data);
  }

  fs.writeFileSync(
    path.resolve(datasetOutDir, "nlQueries.json"),
    JSON.stringify(nlQueriesOut, null, 2)
  );

  // Generate Atlas Search aggregation pipelines for the NL queries
  console.log(
    "Generating Atlas Search aggregation pipelines for the NL queries..."
  );
  const { results: dbQCodeNodesByNlQuery } = await PromisePool.for(nlQueryNodes)
    .withConcurrency(llmConfigs.dbQueries.concurrency ?? DEFAULT_CONCURRENCY)
    .process(async (nlQueryNode) => {
      const dbCodeNodes = await generateAtlasSearchCode(
        nlQueryNode,
        llmConfigs.dbQueries.llmConfig,
        llmConfigs.dbQueries.numGenerations
      );

      console.log(
        `Generated ${dbCodeNodes.length} Atlas Search queries for NL query: ${nlQueryNode.data.query}`
      );
      return dbCodeNodes;
    });

  const datasetEntries: DatabaseNlQueryDatasetEntry[] = [];

  for (const dbCodeNodes of dbQCodeNodesByNlQuery) {
    const { results: dbExecutions } = await PromisePool.for(dbCodeNodes)
      .withConcurrency(
        llmConfigs.dbExecutions.concurrency ?? DEFAULT_CONCURRENCY
      )
      .process(async (dbCodeNode) => {
        console.log(`and NL query: ${dbCodeNode.parent?.data.query}`);
        console.log(
          `Generating Atlas Search DB execution for ${dbCodeNode.data.code}`
        );
        const dbExecution = await generateDatabaseExecutionResult({
          database: {
            name: dataset.databaseName,
            uri: "n/a",
          },
          generatedQuery: dbCodeNode,
          executor: async (params) =>
            executeAtlasSearchQuery({
              ...params,
              collectionName: dataset.collectionName,
            }),
        });

        if (
          Array.isArray(dbExecution.data.result) &&
          dbExecution.data.result.length > maxResultsArraySize
        ) {
          throw new Error(
            `Result array is too large to process. Result array length: ${dbExecution.data.result.length}, maxResultsArraySize: ${maxResultsArraySize}`
          );
        }
        if (dbExecution.data.error) {
          console.error(
            `Error generating Atlas Search DB execution: ${dbExecution.data.error.message}`
          );
        }

        console.log(
          `Generated Atlas Search DB execution: ${dbExecution.data.result
            ?.toString()
            .slice(0, 20)} ...`
        );
        const { success, reason } = isReasonableResult(dbExecution.data.result);
        if (!success) {
          throw new Error("Result is not reasonable. Reason: " + reason);
        }
        return dbExecution;
      });
    console.log(`Generated ${dbExecutions.length} Atlas Search DB executions.`);

    try {
      // Find the most frequent and performant database execution result
      const { fastestMostFrequentIndex } =
        findMostFrequentAndPerformantDatabaseExecutionResult(
          dbExecutions.map((node) => node.data)
        );
      if (fastestMostFrequentIndex !== null) {
        const execution = dbExecutions[fastestMostFrequentIndex];
        if (execution.data.result !== null) {
          const dbResult = execution.data.result;
          if (dbResult && Array.isArray(dbResult) && dbResult.length > 0) {
            execution.data.isReferenceAnswer = true;
          }
        }
      }

      for (const dbExecution of dbExecutions) {
        const textToAtlasSearchDatasetEntry =
          generateDatabaseNlQueryDatasetEntryAtlasSearch(dbExecution);

        // Store for rewriting step
        datasetEntries.push(textToAtlasSearchDatasetEntry);

        if (dbExecution.data.isReferenceAnswer) {
          console.log(
            `Writing entry for NL query: ${textToAtlasSearchDatasetEntry.nlQuery}`
          );
          fs.appendFileSync(
            referenceAnswersOutputPath,
            JSON.stringify(textToAtlasSearchDatasetEntry) + "\n"
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const referenceAnswers = datasetEntries.filter(
    (entry) => entry.isReferenceAnswer
  );

  console.log(
    `Found ${referenceAnswers} reference answers out of ${datasetEntries.length} entries.`
  );

  console.log("\n--------------------------------\n");
  console.log(
    `Successfully completed Atlas Search dataset generation with ${referenceAnswers.length} entries!`
  );
  console.log("Output file:");
  console.log(referenceAnswersOutputPath);
  console.log("\n--------------------------------\n");
}

async function main() {
  initLogger({
    projectName: "natural-language-to-atlas-search",
  });
  // Set up
  const { MONGODB_TEXT_TO_CODE_CONNECTION_URI } = assertEnvVars({
    ...DATABASE_NL_QUERIES,
  });
  const mongoClient = new MongoClient(MONGODB_TEXT_TO_CODE_CONNECTION_URI);

  const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

  // Validate that dataOutDir exists. Create if it doesn't
  if (!fs.existsSync(dataOutDir)) {
    fs.mkdirSync(dataOutDir, { recursive: true });
    console.log(`Created directory: ${dataOutDir}`);
  }

  const defaultLlmConfig: LlmOptions = {
    model: "gpt-5",
    temperature: 0.4,
    seed: 42,
    reasoning_effort: "medium",
  };

  // One point to control generations at each level.
  // Useful for debugging.
  const config = {
    database: {
      llmConfig: {
        ...defaultLlmConfig,
        temperature: 0,
      },
    },
    users: { numGenerations: 20, llmConfig: defaultLlmConfig, concurrency: 8 },
    useCases: {
      numGenerations: 4,
      llmConfig: defaultLlmConfig,
      concurrency: 10,
    },
    nlQueries: {
      numGenerations: 8,
      llmConfig: defaultLlmConfig,
      concurrency: 10,
    },
    dbQueries: {
      numGenerations: 8,
      llmConfig: defaultLlmConfig,
      concurrency: 10,
    },
    dbExecutions: {
      concurrency: 20,
    },
  } as const satisfies LlmGenerationConfig;

  // Load Atlas Search index definition
  const atlasSearchIndexDefinitionPath = path.resolve(
    __dirname,
    "..",
    "..",
    "mongodb_datasets",
    "atlas_search_dataset_index.jsonc"
  );
  const atlasSearchIndexDefinition = fs.readFileSync(
    atlasSearchIndexDefinitionPath,
    "utf8"
  );
  console.log(
    "Atlas Search Index Definition loaded:",
    atlasSearchIndexDefinition.slice(0, 50),
    "..."
  );
  const collectionName = "articles";

  const atlasSearchDatabase: GenerateAtlasSearchDatasetParams["dataset"] = {
    databaseName: "wikipedia_dataset",
    collectionName,
    numSamplesPerCollection: 2,
    // The dataset is from 2023
    latestDate: new Date("2023-12-31"),
    mongoClient,
    searchIndexes: {
      [collectionName]: [atlasSearchIndexDefinition],
    },
  };

  // Run it
  try {
    const now = Date.now();
    await mongoClient.connect();

    // Note: Atlas Search requires a specific collection name
    // You'll need to specify which collection has the Atlas Search index

    await generateAtlasSearchDataset({
      persistence: {
        mongoClient,
        databaseName: "atlas_search_datasets",
        collectionName: "atlas_search_datasets",
      },
      dataset: atlasSearchDatabase,
      llmConfigs: config,
      datasetUuid: `atlas_search_${defaultLlmConfig.model}_temp_${
        defaultLlmConfig.temperature
      }_${now.toString()}`,
      writeToFile: {
        dataOutDir,
      },
    });
  } finally {
    await mongoClient.close();
  }
}

main();
