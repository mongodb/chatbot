import { ObjectId, logger } from "mongodb-rag-core";
import { CommandMetadataStore } from "../CommandMetadataStore";
import { GenerateDataFunc } from "./GenerateDataFunc";
import { GeneratedDataStore } from "./GeneratedDataStore";
import { SomeTestCase } from "./TestCase";

export interface GenerateParams {
  /**
    Test cases to generate data from.
   */
  testCases: SomeTestCase[];

  /**
    Name of the command that generated the data.
   */
  name: string;

  /**
    Function to generate data from test cases.
   */
  generator: GenerateDataFunc;

  /**
    Store for generated data.
   */
  generatedDataStore: GeneratedDataStore;

  /**
    Store for command metadata.
   */
  metadataStore: CommandMetadataStore;
}

/**
  Generate data for test cases and store metadata about the generation.
 */
export async function generateDataAndMetadata({
  testCases,
  name,
  generator,
  generatedDataStore,
  metadataStore,
}: GenerateParams) {
  const startTime = new Date();
  const runId = new ObjectId();
  logger.info(`Generating ${testCases.length} test cases for ${name}`);
  // do stuff
  const { generatedData, failedCases } = await generator({ testCases, runId });
  for (const failedCase of failedCases) {
    logger.error(`Failed to generate data for test case: ${failedCase.name}`);
  }
  await generatedDataStore.insertMany(generatedData);

  const endTime = new Date();
  const metadata = {
    _id: runId,
    command: "generate",
    name,
    startTime,
    endTime,
  };
  await metadataStore.insertOne(metadata);
  logger.info(
    `Generated data for ${generatedData.length}/${testCases.length} test cases for generate data command '${name}'`
  );
  logger.info(metadata);
  return { generatedData, failedCases, metadata };
}
