import { ObjectId } from "mongodb-rag-core";
import { GenerateDataFunc } from "../generate/GenerateDataFunc";
import {
  ConversationGeneratedData,
  SomeGeneratedData,
} from "../generate/GeneratedDataStore";
import { TRIGGER_SERVER_ERROR_MESSAGE } from "./mockExpressApp";
import { strict as assert } from "assert";
import {
  ConversationTestCase,
  isConversationTestCase,
  SomeTestCase,
} from "../generate/TestCase";
import { Message } from "mongodb-chatbot-server";

export const mockGenerateDataFunc: GenerateDataFunc = async ({
  runId,
  testCases,
}) => {
  const failedCases: SomeTestCase[] = [];
  const generatedData: ConversationGeneratedData[] =
    // Note: not sure why I need to cast this to ConversationTestCase[]
    // The code still compiles in editor without this,
    // but it doesn't at run-time in the tests.
    // Very strange, but I don't think it's problematic.
    (
      testCases.filter((testCase) =>
        isConversationTestCase(testCase)
      ) as ConversationTestCase[]
    )
      .filter((testCase) => {
        assert(
          Array.isArray(testCase.data.messages),
          "something is wrong here"
        );
        const isFailed =
          testCase.data?.messages?.[0].content === TRIGGER_SERVER_ERROR_MESSAGE;
        if (isFailed) {
          failedCases.push(testCase);
        }
        return !isFailed;
      })
      .map(
        (testCase) =>
          ({
            _id: new ObjectId(),
            commandRunId: runId,
            type: "conversation",
            data: {
              messages: [
                ...(testCase?.data?.messages ?? []),
                {
                  content: "This is a test message",
                  role: "assistant",
                },
              ] as Message[],
              _id: new ObjectId(),
              createdAt: new Date(),
            },
            evalData: {
              name: "Test case",
            },
            createdAt: new Date(),
          } satisfies ConversationGeneratedData)
      ) satisfies SomeGeneratedData[];
  return {
    generatedData,
    failedCases,
  };
};
