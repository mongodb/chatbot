import { ObjectId } from "mongodb-rag-core";
import { GeneratedData } from "./GeneratedDataStore";
import { TestCase } from "./TestCase";
import { Express } from "express";

export interface GenerateDataFuncParams<T extends TestCase> {
  /**
    Test cases to generate data for.
   */
  testCases: T[];
  /**
    Unique ID for all generated data for this run.
   */
  runId: ObjectId;
}

export type GenerateDataFunc<T extends TestCase, U extends GeneratedData> = (
  params: GenerateDataFuncParams<T>
) => Promise<U[]>;
