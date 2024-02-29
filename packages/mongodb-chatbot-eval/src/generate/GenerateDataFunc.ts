import { ObjectId } from "mongodb-rag-core";
import { SomeGeneratedData } from "./GeneratedDataStore";
import { SomeTestCase } from "./TestCase";

export interface GenerateDataFuncParams {
  /**
    Test cases to generate data for.
   */
  testCases: SomeTestCase[];
  /**
    Unique ID for all generated data for this run.
   */
  runId: ObjectId;
}

export type GenerateDataFunc = (params: GenerateDataFuncParams) => Promise<{
  generatedData: SomeGeneratedData[];
  failedCases: SomeTestCase[];
}>;
