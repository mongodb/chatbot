import { getConversationsTestCasesFromYaml } from "../generate/getConversationsTestCasesFromYaml";
import path from "path";
import fs from "fs";
import {
  TRIGGER_SERVER_ERROR_MESSAGE,
  makeMockExpressApp,
} from "./mockExpressApp";
import { ConversationTestCase } from "../generate/TestCase";

const testDataBasePath = path.resolve(__dirname, "..", "..", "testData");

export const testCases = getConversationsTestCasesFromYaml(
  fs.readFileSync(
    path.join(testDataBasePath, "conversation_tests.yaml"),
    "utf8"
  )
);

export const improperlyFormattedTestCases = fs.readFileSync(
  path.join(testDataBasePath, "not_conversation_test.yaml"),
  "utf8"
);

/**
  Test case that triggers a mock server error. See {@link makeMockExpressApp} implementation for details.
 */
export const triggerErrorTestCases = [
  {
    name: "conversation",
    data: {
      messages: [
        {
          content: TRIGGER_SERVER_ERROR_MESSAGE,
          role: "user",
        },
      ],
      skip: false,
      expectation: "foo",
      name: "bar",
    },
  },
] satisfies ConversationTestCase[];
