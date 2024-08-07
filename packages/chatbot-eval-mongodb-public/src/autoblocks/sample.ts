import { runTestSuite, BaseHasAllSubstrings } from "@autoblocks/client/testing";

interface TestCase {
  input: string;
  expectedSubstrings: string[];
}

class HasAllSubstrings extends BaseHasAllSubstrings<TestCase, string> {
  id = "has-all-substrings";

  outputMapper(args: { output: string }) {
    return args.output;
  }

  testCaseMapper(args: { testCase: TestCase }) {
    return args.testCase.expectedSubstrings;
  }
}

runTestSuite<TestCase, string>({
  id: "my-test-suite",
  testCases: [
    {
      input: "hello world",
      expectedSubstrings: ["hello", "world"],
    },
  ], // Replace with your test cases
  testCaseHash: ["input"],
  fn: ({ testCase }) => testCase.input, // Replace with your LLM call
  evaluators: [new HasAllSubstrings()], // Replace with your evaluators
});

// Read more: https://docs.autoblocks.ai/testing/quick-start
