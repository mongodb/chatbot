import { ObjectId } from "mongodb-rag-core";
import { GenerateDataFunc } from "../generate/GenerateDataFunc";
import { SomeGeneratedData } from "../generate/GeneratedDataStore";
import { TRIGGER_SERVER_ERROR_MESSAGE } from "./mockExpressApp";
import { strict as assert } from "assert";
import { SomeTestCase } from "../generate/TestCase";

export const mockGenerateDataFunc: GenerateDataFunc = async ({
  runId,
  testCases,
}) => {
  const failedCases: SomeTestCase[] = [];
  const generatedData: SomeGeneratedData[] = testCases
    .filter((testCase) => {
      assert(Array.isArray(testCase.data.messages), "something is wrong here");
      const isFailed =
        testCase.data.messages[0].content === TRIGGER_SERVER_ERROR_MESSAGE;
      if (isFailed) {
        failedCases.push(testCase);
      }
      return !isFailed;
    })
    .map((testCase) => ({
      _id: new ObjectId(),
      commandRunId: runId,
      type: "conversation",
      data: {
        name: testCase.name,
      },
    }));
  return {
    generatedData,
    failedCases,
  };
};
